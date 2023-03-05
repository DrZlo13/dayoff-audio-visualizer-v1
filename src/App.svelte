<script>
  import { code_getter } from "./lib/code.ts";
  import P5Canvas from "./lib/P5Canvas.svelte";

  import { p5 } from "p5js-wrapper";
  import "p5js-wrapper/sound";

  let p5_object;
  const sketch = (_p5) => {
    let width = innerWidth;
    let height = innerHeight;
    let max_width = Math.min(width, height);

    let audio_ctx;

    let fft_waveform;
    let fft;
    const fft_smooth = 0.6;
    const fft_bins = 64;

    let filter;

    _p5.setup = () => {
      _p5.createCanvas(width, height);
      audio_ctx = _p5.getAudioContext();
      audio_ctx.audioIn = new p5.AudioIn();
      audio_ctx.audioIn.start();

      fft_waveform = new p5.FFT(0.1, 1024);
      fft_waveform.setInput(audio_ctx.audioIn);

      filter = new p5.HighPass();
      filter.freq(2000);
      filter.res(0.0);
      filter.disconnect();
      audio_ctx.audioIn.connect(filter);

      fft = new p5.FFT(fft_smooth, fft_bins);
      fft.setInput(audio_ctx.audioIn);

      p5_object = _p5;
    };

    _p5.update = () => {
      _p5.getAudioContext().resume();
      fft_waveform.analyze();
    };

    function draw_gradient(_p5, x, y, w, h, c1, c2, axis) {
      _p5.noFill();

      if (axis === _p5.Y_AXIS) {
        // Top to bottom gradient
        for (let i = y; i <= y + h; i++) {
          let inter = _p5.map(i, y, y + h, 0, 1);
          let c = _p5.lerpColor(c1, c2, inter);
          _p5.stroke(c);
          _p5.line(x, i, x + w, i);
        }
      } else if (axis === _p5.X_AXIS) {
        // Left to right gradient
        for (let i = x; i <= x + w; i++) {
          let inter = _p5.map(i, x, x + w, 0, 1);
          let c = _p5.lerpColor(c1, c2, inter);
          _p5.stroke(c);
          _p5.line(i, y, i, y + h);
        }
      }
    }

    let last_energy = 0;
    _p5.draw = () => {
      _p5.clear();

      let spectrum = fft.analyze();
      let energy = fft.getEnergy("mid");
      let energy_diff = Math.abs(energy - last_energy);

      let circle_max_width = max_width * 0.5;
      circle_max_width =
        circle_max_width / 2 + circle_max_width * (energy / 255) * 1.2;
      let scale_factor = circle_max_width / max_width;

      // draw gradient
      let c1 = _p5.color(0, 0, 0, 0);
      let c2 = _p5.color(0, 0, 0);
      draw_gradient(_p5, 0, 0, width, height * 0.3, c2, c1, _p5.Y_AXIS);
      draw_gradient(
        _p5,
        0,
        height - height * 0.3,
        width,
        height * 0.3,
        c1,
        c2,
        _p5.Y_AXIS
      );

      // _p5.fill(255, 255, 255);
      // for (let i = 0; i < spectrum.length; i++) {
      //   let x = _p5.map(i, 0, spectrum.length, 0, width);
      //   let h = -height + _p5.map(spectrum[i], 0, 255, height, 0);
      //   _p5.rect(x, height, width / spectrum.length, h);
      // }

      // draw rectangles
      _p5.noStroke();
      _p5.fill(255, 255, 255);
      let rect_width = 10 * scale_factor;
      let rect_height = (circle_max_width / 2) * 0.5;

      _p5.push();
      _p5.translate(width / 2, height / 2);

      // drop last bins of fft
      spectrum = spectrum.slice(0, spectrum.length - 6);

      let fft_len = spectrum.length;
      for (let r = 0; r < 4; r++) {
        _p5.push();
        _p5.rotate(_p5.TWO_PI / 4);
        for (let i = 0; i < fft_len; i++) {
          _p5.push();
          _p5.rotate(((i / fft_len) * _p5.TWO_PI) / 4 + _p5.HALF_PI * r);
          _p5.translate(-rect_width / 2, 0);
          let h = rect_height;
          let sample = spectrum[i];
          if (r === 1 || r === 3) {
            sample = spectrum[fft_len - i - 1];
          }
          h = h * (sample / 255);

          _p5.rect(0, circle_max_width / 2 + 10, rect_width, h);
          _p5.pop();
        }
        _p5.pop();
      }

      // for (let r = 0; r < 2; r++) {
      //   _p5.push();
      //   _p5.rotate(_p5.TWO_PI / 2);
      //   for (let i = 0; i < fft_len; i++) {
      //     _p5.push();
      //     _p5.rotate(((i / fft_len) * _p5.TWO_PI) / 2 + _p5.PI * r);
      //     _p5.translate(-rect_width / 2, 0);
      //     let h = rect_height;
      //     let sample = spectrum[i];
      //     if (r === 1 || r === 3) {
      //       sample = spectrum[fft_len - i - 1];
      //     }
      //     h = h * (sample / 255);

      //     _p5.rect(0, circle_max_width / 2 + 10, rect_width, h);
      //     _p5.pop();
      //   }
      //   _p5.pop();
      // }

      _p5.pop();

      // _p5.fill(255, 255, 255);
      // for (let i = 0; i < spectrum.length; i++) {
      //   let x = _p5.map(i, 0, spectrum.length, 0, width);
      //   let h = -height + _p5.map(spectrum[i], 0, 255, height, 0);
      //   _p5.rect(x, height, width / spectrum.length, h);
      // }

      _p5.fill(255, 255, 255);
      _p5.stroke(0, 0, 0);
      _p5.strokeWeight(10);
      _p5.ellipse(
        _p5.width / 2,
        _p5.height / 2,
        circle_max_width,
        circle_max_width
      );

      // text
      _p5.fill(0, 0, 0);
      _p5.stroke(0, 0, 0);
      _p5.strokeWeight(0);
      _p5.textStyle(_p5.BOLD);
      _p5.textFont("Helvetica");
      _p5.textSize(circle_max_width * 0.3);
      _p5.textAlign(_p5.CENTER, _p5.CENTER);
      _p5.text("DAY", _p5.width / 2, _p5.height / 2 - circle_max_width / 4.7);
      _p5.text("OFF", _p5.width / 2, _p5.height / 2 + circle_max_width / 4);

      let waveform = fft_waveform.waveform();

      let max = 0;
      for (let i = 0; i < waveform.length; i++) {
        if (waveform[i] > max) {
          max = waveform[i];
        }
      }

      // generate gauss window
      let gauss_window = [];
      let gauss_window_len = waveform.length;
      let gauss_window_sigma = 300;

      for (let i = 0; i < gauss_window_len; i++) {
        let x = i - gauss_window_len / 2;
        let g = _p5.exp(
          (-0.5 * (x * x)) / (gauss_window_sigma * gauss_window_sigma)
        );
        gauss_window.push(g);
      }

      for (let i = 0; i < waveform.length; i++) {
        waveform[i] = waveform[i] / max;
        waveform[i] = gauss_window[i] * waveform[i];
      }

      _p5.noFill();
      _p5.strokeWeight(4);
      _p5.stroke(0, 0, 0);

      _p5.beginShape();
      for (let i = 0; i < waveform.length; i++) {
        let radius = circle_max_width / 2;
        let x = _p5.map(i, 0, waveform.length, -radius * 0.8, radius * 0.8);
        let y = _p5.map(waveform[i], -1, 1, -radius * 0.2, radius * 0.2);
        x += _p5.width / 2;
        y += _p5.height / 2;
        _p5.vertex(x, y);
      }
      _p5.endShape();

      last_energy = energy;
    };

    _p5.windowResized = () => {
      _p5.resizeCanvas(_p5.windowWidth, _p5.windowHeight);
      width = innerWidth;
      height = innerHeight;
      max_width = Math.min(width, height);
    };

    let fullscreen = false;
    function openFullscreen(elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        57;
        /* IE11 */
        elem.msRequestFullscreen();
      }
      fullscreen = true;
    }

    function closeFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        // @ts-ignore
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        // @ts-ignore
        document.webkitExitFullscreen();
        // @ts-ignore
      } else if (document.msExitFullscreen) {
        /* IE11 */
        // @ts-ignore
        document.msExitFullscreen();
      }
      fullscreen = false;
    }

    _p5.mouseClicked = () => {
      if (audio_ctx.state !== "running") {
        audio_ctx.resume();
      }

      var elem = document.documentElement;

      if (fullscreen) {
        closeFullscreen();
      } else {
        openFullscreen(elem);
      }
    };
  };

  let code_line = Math.floor(Math.random() * code_getter().split("\n").length);
  let code_lines_on_screen = 100;
  const code_lines_generator = () => {
    let code_lines = code_getter().split("\n");
    let code_lines_return = [];

    // get
    code_lines_return = code_lines.slice(
      code_line,
      code_line + code_lines_on_screen
    );

    // wrap
    if (code_lines_return.length < code_lines_on_screen) {
      code_lines_return = code_lines_return.concat(
        code_lines.slice(0, code_lines_on_screen - code_lines_return.length)
      );
    }

    // replace tabs and spaces
    code_lines_return = code_lines_return.map((line, i) => {
      return line
        .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
        .replace(/ /g, "&nbsp;");
    });

    return code_lines_return;
  };

  let code_lines = [...code_lines_generator()];

  setInterval(() => {
    code_line++;
    if (code_line > code_getter().split("\n").length) {
      code_line = 0;
    }
    code_lines = [...code_lines_generator()];
  }, 500);
</script>

<main>
  <div class="background-code">
    {#each code_lines as line}
      {#if line}
        <p>{@html line}</p>
      {:else}
        <p>&nbsp;</p>
      {/if}
    {/each}
  </div>
  <div class="foreground">
    <P5Canvas {sketch} id="test" />
  </div>
</main>

<style>
  main {
    position: relative;
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    overflow: hidden;
  }

  .background-code {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    color: rgba(0, 255, 0, 0.9);
    padding: 1rem;
    font-family: monospace;
    font-size: 1.9vw;
    font-weight: bolder;
  }

  .background-code p {
    margin: 0;
  }

  .foreground {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
  }
</style>

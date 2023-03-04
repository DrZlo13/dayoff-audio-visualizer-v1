<script>
    export let id;
    import { p5 } from "p5js-wrapper";
    import "p5js-wrapper/sound";

    export let sketch;

    import { onMount } from "svelte";

    onMount(function () {
        let myp5 = new p5(sketch, id);
    });
</script>

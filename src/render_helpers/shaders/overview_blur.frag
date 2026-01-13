precision highp float;

#if defined(DEBUG_FLAGS)
uniform float niri_tint;
#endif

uniform sampler2D niri_tex;
uniform vec2 niri_size;
uniform float blur_radius;
uniform float niri_alpha;

varying vec2 niri_v_coords;

vec4 sample_tex(vec2 offset) {
    return texture2D(niri_tex, niri_v_coords + offset);
}

void main() {
    vec2 texel = blur_radius / niri_size;

    vec4 color = vec4(0.0);
    color += sample_tex(vec2(-texel.x, -texel.y));
    color += sample_tex(vec2(0.0, -texel.y));
    color += sample_tex(vec2(texel.x, -texel.y));
    color += sample_tex(vec2(-texel.x, 0.0));
    color += sample_tex(vec2(0.0, 0.0));
    color += sample_tex(vec2(texel.x, 0.0));
    color += sample_tex(vec2(-texel.x, texel.y));
    color += sample_tex(vec2(0.0, texel.y));
    color += sample_tex(vec2(texel.x, texel.y));
    color *= 1.0 / 9.0;

    color *= niri_alpha;

#if defined(DEBUG_FLAGS)
    if (niri_tint == 1.0)
        color = vec4(0.0, 0.2, 0.0, 0.2) + color * 0.8;
#endif

    gl_FragColor = color;
}

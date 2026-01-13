precision highp float;

#if defined(DEBUG_FLAGS)
uniform float niri_tint;
#endif

uniform sampler2D niri_tex;
uniform vec2 niri_size;
uniform float blur_radius;
uniform float blur_quality;
uniform float niri_alpha;

varying vec2 niri_v_coords;

vec4 sample_tex(vec2 offset) {
    return texture2D(niri_tex, niri_v_coords + offset);
}

void main() {
    vec2 texel = blur_radius / niri_size;
    int quality = int(blur_quality);
    quality = clamp(quality, 1, 3);

    vec4 color = vec4(0.0);
    float total = 0.0;

    for (int y = -3; y <= 3; y++) {
        for (int x = -3; x <= 3; x++) {
            if (abs(x) > quality || abs(y) > quality) {
                continue;
            }
            color += sample_tex(vec2(float(x), float(y)) * texel);
            total += 1.0;
        }
    }

    color *= 1.0 / total;

    color *= niri_alpha;

#if defined(DEBUG_FLAGS)
    if (niri_tint == 1.0)
        color = vec4(0.0, 0.2, 0.0, 0.2) + color * 0.8;
#endif

    gl_FragColor = color;
}

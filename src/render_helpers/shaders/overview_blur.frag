precision highp float;

#if defined(DEBUG_FLAGS)
uniform float niri_tint;
#endif

uniform float niri_alpha;
uniform vec2 niri_size;
varying vec2 niri_v_coords;

uniform sampler2D niri_tex;
uniform vec2 niri_direction;
uniform float niri_radius;
uniform float niri_passes;

const int MAX_PASSES = 8;

float gaussian(float x, float sigma) {
    const float pi = 3.141592653589793;
    return exp(-(x * x) / (2.0 * sigma * sigma)) / (sqrt(2.0 * pi) * sigma);
}

void main() {
    if (niri_radius <= 0.0 || niri_passes < 0.5) {
        vec4 color = texture2D(niri_tex, niri_v_coords);
        color.a *= niri_alpha;
        gl_FragColor = color;
        return;
    }

    vec2 texel = niri_direction / niri_size;
    float sigma = max(niri_radius, 0.001);

    vec4 color = texture2D(niri_tex, niri_v_coords);
    float total_weight = 1.0;

    for (int i = 1; i <= MAX_PASSES; i++) {
        if (float(i) > niri_passes) {
            break;
        }

        float weight = gaussian(float(i), sigma);
        vec2 offset = texel * float(i) * niri_radius;
        color += texture2D(niri_tex, niri_v_coords + offset) * weight;
        color += texture2D(niri_tex, niri_v_coords - offset) * weight;
        total_weight += 2.0 * weight;
    }

    color /= total_weight;
    color.a *= niri_alpha;
    gl_FragColor = color;
}

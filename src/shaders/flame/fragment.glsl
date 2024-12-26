uniform sampler2D uAlphaTexture;
uniform vec3 uBaseColor;
uniform vec3 uBaseColorMix;
uniform vec3 uTopColor;
uniform vec3 uTopColorMix;
varying vec2 vUv;

void main() {


    // Base color blending (top to base gradient)
    float mixFactor = smoothstep(-0.3, 1.0, vUv.y);
    float mixFactor2 = step(0.3, vUv.y);

    vec3 baseColor = mix(uBaseColor, uBaseColorMix, smoothstep(0.0, 0.4, vUv.y));
    vec3 topColor = mix(uTopColor, uTopColorMix, mixFactor);
    vec3 color = mix(baseColor, topColor, mixFactor2);
    color = mix(baseColor, topColor, smoothstep(0.0, 0.8, vUv.y));

    // Sample the alpha mask texture
    float alphaColor = texture(uAlphaTexture, vUv).r;

    // Flame center (adjusted to not reach horizontal edges)
    vec2 center = vec2(0.52, 0.0); // Center position horizontally
    float flameCenter = length((vUv - center) * vec2(2.5, 0.8)); // Horizontal stretch

    float centerFalloff = smoothstep(0.1, 2.0, flameCenter) * exp(-vUv.y * 0.1); // Smooth tapering
    alphaColor *= smoothstep(-0.3, 1.0, centerFalloff * 8.0); // Subtract the influence of the center

    alphaColor *= smoothstep(0.1, 0.5, vUv.y);

    // Set the final fragment color
    gl_FragColor = vec4(color, alphaColor);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
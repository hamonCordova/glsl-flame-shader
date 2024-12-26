uniform sampler2D uAlphaTexture;
uniform float uTime;

varying vec2 vUv;

vec2 rotate2D(vec2 value, float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    mat2 m = mat2(c, s, -s, c);
    return m * value;
}

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);

    float res = mix(
        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
}

void main()
{

    vec3 newPosition = position;

    // Flame swing
    newPosition.z = sin(newPosition.x * 5.0 + uTime * 5.0) * uv.y * noise(newPosition.xy * cos(uTime * 0.6) * 1.2) * 0.3;

    // Wind
    vec2 windOffset = vec2(sin(uv.y + uTime * 0.9) * 0.4, 0.0);
    windOffset *= cos(uTime * 0.5) * 0.7;
    windOffset *= uv.y * 3.0;
    newPosition.xz += windOffset * noise(newPosition.xy + uTime);

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;
}

/*uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14

float random(in float x){ return fract(sin(x)*43757.633); }
float random(in vec2 st){ return fract(sin(dot(st.xy ,vec2(12.9898,78.233))) * 43758.5453); }


void main(){
    vec2 st = gl_FragCoord.st/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    vec3 color = vec3(0.360,0.199,0.800);

    // Digits
    float t = u_time;
    float time_i = floor(t);
    float time_f = fract(t);
    color.rgb += cos(color) * time_f * cos(smoothstep(0.9, random(st.xy), color.xyz)) ;

    gl_FragColor = vec4( color , 1.0);
}

*/

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14

float random(in float x){ return fract(sin(x)*43757.633); }
float random(in vec2 st){ return fract(sin(dot(st.xy ,vec2(12.9898,78.233))) * 43758.5453); }


void main(){
    vec2 st = gl_FragCoord.st/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    vec3 color = vec3(0.360,0.199,0.800);

    // Digits
    float t = u_time;
    float time_i = floor(t);
    float time_f = fract(t);
    color.rgb -= cos(color * time_i) + time_f * smoothstep(0.9, random(st.x * PI), mix(color.r, color.g + time_f, random(st)));

    gl_FragColor = vec4( color , 1.0);
}

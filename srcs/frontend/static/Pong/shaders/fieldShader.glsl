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
    color.rgb -= cos(color * time_i) + time_f * smoothstep(0.9, random(st.x * PI), mix(color.r, color.g + time_f, random(st)));

    gl_FragColor = vec4( color , 1.0);
}

// __________________________________________________________________
// Bueno a partir de aqui
#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color; // Añadir el uniforme u_color

vec2 rotate2D(vec2 _st, float _angle){
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
      sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 tile(vec2 _st, float _zoom){
    _st *= _zoom;
    return fract(rotate2D(_st,0.9));
}

float box(vec2 _st, vec2 _size, float _smoothEdges){
    _size = vec2(0.5)-_size*0.5;
    vec2 aa = vec2(_smoothEdges*0.5);
    vec2 uv = smoothstep(_size,_size+aa,_st);
    uv *= smoothstep(_size,_size+aa,vec2(1.0)-_st);
    return uv.x*uv.y;
}

vec2 offset(vec2 _st, vec2 _offset){
    vec2 uv;

    if(_st.x>0.5){
        uv.x = _st.x - 0.5;
    } else {
        uv.x = _st.x + 0.5;
    }

    if(_st.y>0.5){
        uv.y = _st.y - 0.5;
    } else {
        uv.y = _st.y + 0.5;
    }

    return uv;
}

void main(void){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.y *= u_resolution.y/u_resolution.x;

    st = tile(st,10.);

    vec2 offsetSt = offset(st,vec2(0.5));

    st = rotate2D(st,PI*.90);

    vec3 color = vec3( box(offsetSt,vec2(0.95),0.01) );
    color += u_color; // Utilizar el uniforme u_color

    gl_FragColor = vec4(color,1.0);
}

*/
#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color; // Añadir el uniforme u_color

void main(void){
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.y *= u_resolution.y / u_resolution.x;

    // Rellenar con el color uniforme
    vec3 color = u_color;

    gl_FragColor = vec4(color, 1.0);
}

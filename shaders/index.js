export const fragmentShader = `
      varying float vnoise;
       varying vec2 Vuv;
       uniform sampler2D streetTexture;
       uniform float time;
       uniform sampler2D image;

    void main(){
    vec3 color1=vec3(0., 0., 1.);
    vec3 color2=vec3(1., 1., 1.);
    vec2 newUv=Vuv;
     newUv=vec2(newUv.x , newUv.y + 0.01 * sin(newUv.x * 20. + time));
    //  newUv=vec2(newUv.x , newUv.y + 0.01 * sin(noise + time));

     vec4 streetView=texture2D(streetTexture, newUv);
     vec4 imageView=texture2D(image, Vuv);
     // gl_FragColor = finalColor;
    gl_FragColor = imageView;
     gl_FragColor.rgb += vec3(vnoise) * 0.1;
    }
  `

export const vertexShader = `
  vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

  float permute(float x) {
      return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  vec4 permute(vec4 x) {
      return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0);
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0;
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x, gy.x);
    vec2 g10 = vec2(gx.y, gy.y);
    vec2 g01 = vec2(gx.z, gy.z);
    vec2 g11 = vec2(gx.w, gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 *
      vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
  }
    uniform float time;
    varying float vnoise; //varying for passing data, so that It can be accessible  in fragment shader
    varying vec2 Vuv;
    uniform vec2 hover;
    uniform float hoverState;


  void main() {
    vec3 newPosition = position;
    float PI= 3.1415925;
    // float noise= cnoise(vec2(position.x * time/10., position.y * time/5.));
    float noise= cnoise(vec2(position.x -time/20. , position.y -time/40. ));
    // newPosition += normal * noise * 0.2;
    // newPosition.z += 0.1 * noise;
    // newPosition.z += 0.1 ;

    float dist=distance(uv, hover);
    newPosition.z += hoverState * 15. * sin(dist * 0.1 *time);
    vnoise=hoverState * sin(dist  *time) * 0.001;
    vnoise=dist ;
    Vuv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`
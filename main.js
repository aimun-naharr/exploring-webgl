import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import street from './assets/street.jpg';



export default class Sketch {
  constructor(options) {
    this.time = 0;
    this.scene = new THREE.Scene();
    this.dom = options.dom

    this.width = this.dom.offsetWidth;
    this.height = this.dom.offsetHeight;
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 2;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.dom.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.resize()
    this.setUpResize()
    this.addObject()
    this.render()
  }
  setUpResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }
  resize() {
    this.width = this.dom.offsetWidth
    this.height = this.dom.offsetHeight
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix()
  }
  addObject() {
    this.geometry = new THREE.SphereGeometry(0.5, 40, 40);
    this.material = new THREE.MeshNormalMaterial();
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      wireframe: true,
      fragmentShader: `
      varying float vnoise;
       varying vec2 Vuv;
       uniform sampler2D streetTexture;
       uniform float time;

    void main(){
    vec3 color1=vec3(0., 0., 1.);
    vec3 color2=vec3(1., 1., 1.);
    vec2 newUv=Vuv;
     newUv=vec2(newUv.x , newUv.y + 0.01 * sin(newUv.x * 20. + time));
    //  newUv=vec2(newUv.x , newUv.y + 0.01 * sin(noise + time));

     vec4 streetView=texture2D(streetTexture, newUv);

    // vec3 finalColor=mix(color1, color2, (vnoise + 1.)*0.5);
      // gl_FragColor = vec4(Vuv,1.0, 1.0);
      // gl_FragColor = streetView + vec4(vnoise);
      //  gl_FragColor = vec4(vnoise);
      gl_FragColor = vec4(vnoise, vnoise, vnoise, 1.0);
      gl_FragColor = vec4(0., 0.5, 0.5, 1.0);
      // gl_FragColor = finalColor;
    }
  `,
      vertexShader: `
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
  void main() {
    vec3 newPosition = position;
    float PI= 3.1415925;
    // float noise= cnoise(vec2(position.x * time/10., position.y * time/5.));
    float noise= cnoise(vec2(position.x -time/20. , position.y -time/40. ));
    newPosition += normal * noise;
    // newPosition.z += 0.1 * noise;
    // newPosition.z += 0.1 ;
    // vnoise=noise;
    float dist=distance(uv, vec2(0.5));
    vnoise =noise;
    Vuv = uv;
    // newPosition.z += 0.1 * sin((newPosition.x + 0.25 + time/10.0) *2. *PI);
    // newPosition.z =0.04 * sin(dist * 40. - time);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`
      ,
      uniforms: {
        time: {
          value: 0
        },
        streetTexture: {
          value: new THREE.TextureLoader().load(street)
        }
      } // Add any uniforms here if needed
    })
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.cube);
  }
  render() {
    this.time += 0.05;
    // this.cube.rotation.x += 0.01;
    // this.cube.rotation.y += 0.01;
    this.material.uniforms.time.value = this.time
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this))
  }
}
new Sketch({ dom: document.getElementById('app') })
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import street from './assets/street.jpg';
import { fragmentShader, vertexShader } from './shaders';
import FontFaceObserver from 'fontfaceobserver';
import imagesLoaded from 'imagesloaded';
import Scroll from './scroll.js'
import gsap from 'gsap'



export default class Sketch {
  constructor(options) {
    this.time = 0;
    this.scene = new THREE.Scene();
    this.dom = options.dom

    this.width = this.dom.offsetWidth;
    this.height = this.dom.offsetHeight;
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 200, 2000);
    this.camera.position.z = 600;
    // merging dimensions
    this.camera.fov = (2 * Math.atan((this.height / 2) / 600)) * (180 / Math.PI)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    this.dom.appendChild(this.renderer.domElement);
    this.images = [...document.querySelectorAll('img')];

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // const fontOpen = new Promise(resolve => {
    //   new FontFaceObserver("Open Sans").load().then(() => {
    //     resolve()
    //   })

    // })
    // const fontPlayfair = new Promise(resolve => {
    //   new FontFaceObserver("Playfair").load().then(() => {
    //     resolve()
    //   })
    // })

    // const preLoadImages = new Promise(resolve => {
    //   imagesLoaded(document.querySelectorAll("img"), { background: true }, resolve)
    // })

    // const allDone = [preLoadImages];
    // Promise.all(allDone).then(() => {
    this.currentScroll = 0;
    this.scroll = new Scroll()
    this.addImages();
    this.setPositions();
    this.resize()
    this.setUpResize()
    this.addObject()
    this.render()
    this.renderer.setSize(this.width, this.height);
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.mouseMove()


  }

  mouseMove(event) {
    window.addEventListener('mousemove', (event) => {
      this.pointer.x = (event.clientX / this.width) * 2 - 1;
      this.pointer.y = - (event.clientY / this.height) * 2 + 1;
      // update the picking ray with the camera and pointer position
      this.raycaster.setFromCamera(this.pointer, this.camera);

      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects(this.scene.children);
      if (intersects.length > 0) {
        console.log(intersects[0]);
        let obj = intersects[0].object;
        obj.material.uniforms.hover.value = intersects[0].uv
      }
    }, false)
  }

  setUpResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }
  addImages() {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      // wireframe: true,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      uniforms: {
        time: {
          value: 0
        },
        hover: {
          value: new THREE.Vector2(0.5, 0.5)
        },
        image: {
          value: 0
        },
        hoverState: {
          value: 0
        },
        streetTexture: {
          value: new THREE.TextureLoader().load(street)
        }
      } // Add any uniforms here if needed
    })
    this.materials = []
    this.imageStore = this.images.map(img => {
      const bounds = img.getBoundingClientRect()
      const { width, height, top, right, left } = bounds;
      const geometry = new THREE.PlaneGeometry(width, height, 35, 35)
      const texture = new THREE.Texture(img);
      texture.needsUpdate = true;
      // const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
      const material = this.material.clone();
      img.addEventListener('mouseenter', () => {
        gsap.to(material.uniforms.hoverState, {
          duration: 1,
          value: 1
        })
      })
      img.addEventListener('mouseleave', () => {
        gsap.to(material.uniforms.hoverState, {
          duration: 1,
          value: 0
        })
      })
      material.uniforms.image.value = texture;
      this.materials.push(material);

      const mesh = new THREE.Mesh(geometry, material)
      this.scene.add(mesh);
      return {
        width, height, top, left, right, mesh
      }
    })
  }
  setPositions() {
    this.imageStore.forEach(img => {

      img.mesh.position.y = this.currentScroll - img.top + (this.height / 2) - (img.height / 2);
      img.mesh.position.x = img.left - this.width / 2 + img.width / 2;

    })
  }
  resize() {
    this.width = this.dom.offsetWidth
    this.height = this.dom.offsetHeight
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix()
  }
  addObject() {
    this.geometry = new THREE.PlaneGeometry(200, 400, 10, 10);
    this.material = new THREE.MeshNormalMaterial();
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      wireframe: true,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
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
    // this.scene.add(this.cube);
  }
  render() {
    this.time += 0.05;
    this.scroll.render();
    this.currentScroll = this.scroll.scrollToRender;
    this.setPositions();
    // this.cube.rotation.x += 0.01;
    // this.cube.rotation.y += 0.01;
    // this.material.uniforms.time.value = this.time
    this.materials.forEach(m => {
      m.uniforms.time.value = this.time
    })
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this))
  }
}
new Sketch({ dom: document.getElementById('container') })
import * as THREE from './src/utils/build/three.module.js';
import { OrbitControls } from './src/utils/jsm/controls/OrbitControls.js';
import { ImprovedNoise } from './src/utils/jsm/math/ImprovedNoise.js';

class CloudScene {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.mesh = null;
        this.controls = null;
        this.isInitialized = false;
        this.lastTime = 0;
    }

    init() {
        if (this.isInitialized) return;

        // Three.js 初始化
        const canvas = document.getElementById('three-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas, 
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: false
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // 强制设置canvas尺寸为容器大小
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // 设置canvas的DOM尺寸
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = containerHeight + 'px';
        
        // 设置渲染器尺寸
        this.renderer.setSize(containerWidth, containerHeight, false);
        this.renderer.setAnimationLoop(this.animate.bind(this));

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(60, containerWidth / containerHeight, 0.1, 100);
        this.camera.position.set(0, 0, 1.5);

        // 添加OrbitControls - 让云朵可以交互
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableZoom = false; // 禁用缩放
        this.controls.enablePan = false;  // 禁用平移
        this.controls.enableDamping = true; // 启用阻尼效果
        this.controls.dampingFactor = 0.05;

        this.createSky();
        this.createClouds();
        
        this.isInitialized = true;
    }

    createSky() {
        // 添加天空球
        const skyCanvas = document.createElement('canvas');
        skyCanvas.width = 1;
        skyCanvas.height = 32;

        const context = skyCanvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, 32);
        gradient.addColorStop(0.0, '#014a84');
        gradient.addColorStop(0.5, '#0561a0');
        gradient.addColorStop(1.0, '#437ab6');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1, 32);

        const skyMap = new THREE.CanvasTexture(skyCanvas);
        skyMap.colorSpace = THREE.SRGBColorSpace;

        const sky = new THREE.Mesh(
            new THREE.SphereGeometry(10),
            new THREE.MeshBasicMaterial({ map: skyMap, side: THREE.BackSide })
        );
        this.scene.add(sky);
    }

    createClouds() {
        // 创建云朵纹理
        const size = 128;
        const data = new Uint8Array(size * size * size);

        let i = 0;
        const scale = 0.05;
        const perlin = new ImprovedNoise();
        const vector = new THREE.Vector3();

        for (let z = 0; z < size; z++) {
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const d = 1.0 - vector.set(x, y, z).subScalar(size / 2).divideScalar(size).length();
                    data[i] = (128 + 128 * perlin.noise(x * scale / 1.5, y * scale, z * scale / 1.5)) * d * d;
                    i++;
                }
            }
        }

        const texture = new THREE.Data3DTexture(data, size, size, size);
        texture.format = THREE.RedFormat;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        // 着色器代码
        const vertexShader = /* glsl */`
            in vec3 position;
            uniform mat4 modelMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform vec3 cameraPos;
            out vec3 vOrigin;
            out vec3 vDirection;

            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPos, 1.0)).xyz;
                vDirection = position - vOrigin;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        const fragmentShader = /* glsl */`
            precision highp float;
            precision highp sampler3D;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            in vec3 vOrigin;
            in vec3 vDirection;

            out vec4 color;

            uniform vec3 base;
            uniform sampler3D map;

            uniform float threshold;
            uniform float range;
            uniform float opacity;
            uniform float steps;
            uniform float frame;

            uint wang_hash(uint seed) {
                seed = (seed ^ 61u) ^ (seed >> 16u);
                seed *= 9u;
                seed = seed ^ (seed >> 4u);
                seed *= 0x27d4eb2du;
                seed = seed ^ (seed >> 15u);
                return seed;
            }

            float randomFloat(inout uint seed) {
                return float(wang_hash(seed)) / 4294967296.;
            }

            vec2 hitBox(vec3 orig, vec3 dir) {
                const vec3 box_min = vec3(-0.5);
                const vec3 box_max = vec3(0.5);
                vec3 inv_dir = 1.0 / dir;
                vec3 tmin_tmp = (box_min - orig) * inv_dir;
                vec3 tmax_tmp = (box_max - orig) * inv_dir;
                vec3 tmin = min(tmin_tmp, tmax_tmp);
                vec3 tmax = max(tmin_tmp, tmax_tmp);
                float t0 = max(tmin.x, max(tmin.y, tmin.z));
                float t1 = min(tmax.x, min(tmax.y, tmax.z));
                return vec2(t0, t1);
            }

            float sample1(vec3 p) {
                return texture(map, p).r;
            }

            float shading(vec3 coord) {
                float step = 0.01;
                return sample1(coord + vec3(-step)) - sample1(coord + vec3(step));
            }

            vec4 linearToSRGB(in vec4 value) {
                return vec4(mix(pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), value.rgb * 12.92, vec3(lessThanEqual(value.rgb, vec3(0.0031308)))), value.a);
            }

            void main() {
                vec3 rayDir = normalize(vDirection);
                vec2 bounds = hitBox(vOrigin, rayDir);

                if (bounds.x > bounds.y) discard;

                bounds.x = max(bounds.x, 0.0);

                vec3 p = vOrigin + bounds.x * rayDir;
                vec3 inc = 1.0 / abs(rayDir);
                float delta = min(inc.x, min(inc.y, inc.z));
                delta /= steps;

                uint seed = uint(gl_FragCoord.x) * uint(1973) + uint(gl_FragCoord.y) * uint(9277) + uint(frame) * uint(26699);
                vec3 size = vec3(textureSize(map, 0));
                float randNum = randomFloat(seed) * 2.0 - 1.0;
                p += rayDir * randNum * (1.0 / size);

                vec4 ac = vec4(base, 0.0);

                for (float t = bounds.x; t < bounds.y; t += delta) {
                    float d = sample1(p + 0.5);
                    d = smoothstep(threshold - range, threshold + range, d) * opacity;
                    float col = shading(p + 0.5) * 3.0 + ((p.x + p.y) * 0.25) + 0.2;
                    ac.rgb += (1.0 - ac.a) * d * col;
                    ac.a += (1.0 - ac.a) * d;
                    if (ac.a >= 0.95) break;
                    p += rayDir * delta;
                }

                color = linearToSRGB(ac);
                if (color.a == 0.0) discard;
            }
        `;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.RawShaderMaterial({
            glslVersion: THREE.GLSL3,
            uniforms: {
                base: { value: new THREE.Color(0x798aa0) },
                map: { value: texture },
                cameraPos: { value: new THREE.Vector3() },
                threshold: { value: 0.25 },
                opacity: { value: 0.25 },
                range: { value: 0.1 },
                steps: { value: 100 },
                frame: { value: 0 }
            },
            vertexShader,
            fragmentShader,
            side: THREE.BackSide,
            transparent: true
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    animate() {
        if (!this.isInitialized) return;

        const currentTime = performance.now() * 0.001;
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.mesh.material.uniforms.cameraPos.value.copy(this.camera.position);
        this.mesh.rotation.y = -currentTime * 1000 / 7500;
        this.mesh.material.uniforms.frame.value++;
        
        // 正常渲染场景（包含水波纹平面）
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        if (!this.isInitialized) return;

        const canvas = document.getElementById('three-canvas');
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // 更新canvas的DOM尺寸
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = containerHeight + 'px';
        
        // 更新相机
        this.camera.aspect = containerWidth / containerHeight;
        this.camera.updateProjectionMatrix();
        
        // 更新渲染器
        this.renderer.setSize(containerWidth, containerHeight, false);
    }

    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        this.isInitialized = false;
    }
}

// 创建全局实例
const cloudScene = new CloudScene();

// 导出实例和初始化函数
export { cloudScene };
export default cloudScene; 
(function(G){
  'use strict';
  class PresidencyScene {
    constructor(container,sim){
      this.container=container;this.sim=sim;this.mode='palace';this.angle=0.72;this.elevation=0.65;this.zoom=1;this.drag=false;this.pointers=new Map();this.lastTime=0;this.visible=true;this.disposed=false;this.animations=[];
      if(!G.THREE){this.fallback();return;}
      const T=G.THREE;this.T=T;
      try{this.renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{this.fallback();return;}
      this.renderer.setClearColor(0x000000,0);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.setPixelRatio(this.pixelRatio());
      container.appendChild(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','Escena 3D interactiva. Arrastra para girar y usa los botones para acercar.');this.renderer.domElement.setAttribute('role','img');
      this.scene=new T.Scene();this.camera=new T.OrthographicCamera(-30,30,20,-20,0.1,250);
      this.scene.add(new T.HemisphereLight(0xfff6dd,0x68857a,2.8));
      const sun=new T.DirectionalLight(0xfff1d6,3.6);sun.position.set(-20,45,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:0.5,far:150});sun.shadow.bias=-0.001;sun.shadow.normalBias=0.05;this.scene.add(sun);
      const fill=new T.DirectionalLight(0xb4c6d6,0.7);fill.position.set(20,15,-20);this.scene.add(fill);
      this.root=new T.Group();this.scene.add(this.root);this.materials=new Map();
      this.buildPalace();this.bake();this.bind();this.resize();
      this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);
      this.intersection=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;});this.intersection.observe(container);
      this.loop=t=>{if(this.disposed)return;this.frame=requestAnimationFrame(this.loop);if(!this.visible||document.hidden||t-this.lastTime<(this.sim.s.settings.quality==='low'?60:30))return;this.lastTime=t;this.animate(t/1000);this.renderer.render(this.scene,this.camera);};this.frame=requestAnimationFrame(this.loop);
    }
    pixelRatio(){const q=this.sim.s.settings.quality;return Math.min(G.devicePixelRatio||1,q==='low'?1:q==='high'?2:1.5);}
    fallback(){this.container.classList.add('scene-fallback');this.container.innerHTML='<div class="fallback-palace"><span>⚑</span><div class="fallback-roof"></div><div class="fallback-columns">▥ ▥ ▥ ▥ ▥</div><div class="fallback-steps"></div></div><p>Vista ligera · La simulación sigue disponible</p>';}
    mat(color,roughness=0.8){const key=color+'-'+roughness;if(!this.materials.has(key))this.materials.set(key,new this.T.MeshStandardMaterial({color,roughness}));return this.materials.get(key);}
    box(x,y,z,w,h,d,color,parent=this.root){const mesh=new this.T.Mesh(new this.T.BoxGeometry(w,h,d),this.mat(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
    cylinder(x,y,z,rt,rb,h,color,n=12,parent=this.root){const mesh=new this.T.Mesh(new this.T.CylinderGeometry(rt,rb,h,n),this.mat(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
    sphere(x,y,z,r,color,sx=1,sy=1,sz=1){const mesh=new this.T.Mesh(new this.T.IcosahedronGeometry(r,1),this.mat(color));mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;this.root.add(mesh);return mesh;}
    tree(x,z,scale=1,type=0){this.cylinder(x,1.4*scale,z,0.16*scale,0.25*scale,2.8*scale,0x89705a);if(type){this.cylinder(x,3.4*scale,z,0,1.3*scale,4.5*scale,0x3c6652,8);this.cylinder(x,4.6*scale,z,0,0.9*scale,3.3*scale,0x4d7c5c,8);}else{this.sphere(x,3.4*scale,z,1.6*scale,0x648269,1,1.15,1);this.sphere(x-0.6*scale,3.0*scale,z+0.3*scale,1.1*scale,0x769471);}}
    roof(x,y,z,w,d,h,color){const T=this.T,shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,h);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});const m=new T.Mesh(geo,this.mat(color));m.position.set(x,y,z-d/2);m.castShadow=true;this.root.add(m);return m;}
    buildPalace(){
      this.box(0,-0.55,0,51,1,33,0xb0b9a0);this.box(0,-0.02,0,49,0.12,31,0x82977b);
      this.box(0,0.02,11,46,0.12,5.8,0xd7c9ae);this.box(0,0.04,1,7,0.12,23,0xdacbb0);
      this.box(-12,0.03,3,12,0.12,11,0x98a181);this.box(12,0.03,3,12,0.12,11,0x98a181);
      // Un palacio de estilo clásico, construido por completo con geometría local.
      this.box(0,3,-5,27,6,8,0xe9dfc7);this.box(0,0.45,-5,28,0.7,8.6,0xc5bda8);this.box(0,6.0,-5,28,0.45,8.7,0xf1e8d4);
      this.roof(0,6.2,-5,29,9.4,2.1,0x57645f);
      this.box(-15,2.25,-4,4,4.5,9,0xe0d6bf);this.box(15,2.25,-4,4,4.5,9,0xe0d6bf);this.box(-15,4.6,-4,4.7,0.4,9.7,0x6f7768);this.box(15,4.6,-4,4.7,0.4,9.7,0x6f7768);
      for(const x of [-11,-8,-5,5,8,11])for(const y of [2,4.7]){
        this.box(x,y,-0.94,1.2,1.65,0.13,0xa4b2a4);this.box(x,y,-0.83,0.06,1.67,0.08,0xe9dfc7);this.box(x,y,-0.82,1.22,0.07,0.08,0xe9dfc7);
        this.box(x-0.8,y,-0.83,0.28,1.85,0.15,0x536b59);this.box(x+0.8,y,-0.83,0.28,1.85,0.15,0x536b59);this.box(x,y-0.9,-0.76,1.8,0.12,0.3,0xf5ecdb);
      }
      this.box(0,1.7,-0.85,2.2,3.2,0.3,0x456154);this.box(0,3.8,-0.7,2.4,0.18,0.5,0xefdfbc);
      for(const x of [-3,-1,1,3]){this.cylinder(x,2.7,1.0,0.21,0.26,4.5,0xf6ecd7,14);this.box(x,0.5,1,0.7,0.35,0.7,0xd4c8ae);this.box(x,4.9,1,0.7,0.25,0.7,0xf6ecd7);}
      this.box(0,5.2,0.6,7.5,0.5,4,0xece2cd);this.roof(0,5.48,0.6,8,4.3,1.6,0xece2cd);
      this.box(0,0.26,2.1,8,0.4,3,0xd3c6aa);this.box(0,0.12,3,9,0.2,3,0xe4d5b7);
      this.cylinder(0,9,-5,0.055,0.07,4.8,0xe9dfc7,8);
      const flagGeo=new this.T.PlaneGeometry(2.4,1.4,10,3);const colors=[];const pos=flagGeo.attributes.position;
      for(let i=0;i<pos.count;i++){const y=pos.getY(i),c=new this.T.Color(Math.abs(y)<0.35?0xe6b44f:0xc44e47);colors.push(c.r,c.g,c.b);}
      flagGeo.setAttribute('color',new this.T.Float32BufferAttribute(colors,3));const flag=new this.T.Mesh(flagGeo,new this.T.MeshStandardMaterial({vertexColors:true,side:this.T.DoubleSide,roughness:0.8}));flag.position.set(1.2,10.4,-5);this.root.add(flag);this.flag=flag;
      // Parterres, fuente, farolas y avenida.
      for(const x of [-10,10]){
        this.box(x,0.2,5,7,0.4,6.5,0x526d4d);this.box(x,0.42,5,5.6,0.15,5.1,0xb7aa82);
        this.cylinder(x,0.6,5,1.8,1.9,0.4,0xd4c5aa,28);this.cylinder(x,0.84,5,1.55,1.55,0.08,0x719c9d,28);
        this.cylinder(x,1.17,5,0.18,0.36,0.65,0xdfd3b8);this.sphere(x,1.6,5,0.25,0xc7dde0);this.animations.push({x,z:5});
        for(let j=0;j<10;j++){const a=j*Math.PI/5;this.sphere(x+Math.cos(a)*2.55,0.63,5+Math.sin(a)*2.55,0.22,j%2?0xc18869:0xe6c9a4,1,0.6,1);}
      }
      for(const x of [-21,21])for(const z of [-11,-4,3,10])this.tree(x,z,0.85+(z+11)*0.005,z===-11?1:0);
      for(const x of [-17,-8,7,17])this.tree(x,-13,0.9,1);
      for(const x of [-5,5])for(const z of [6,12]){this.cylinder(x,1.7,z,0.07,0.1,3.2,0x43574d,8);this.box(x,3.4,z,0.5,0.65,0.5,0xe3d8af);this.box(x,3.8,z,0.7,0.12,0.7,0x43574d);}
      this.box(0,0.02,16,57,0.1,4,0x7c8379);for(let x=-26;x<28;x+=4)this.box(x,0.1,16,1.6,0.03,0.12,0xc5c4ab);
      this.car(-15,16,0x334f50);this.car(13,16,0xd6c5a5);
      this.box(0,0.12,-16,48,0.15,0.5,0x697c68);
    }
    car(x,z,color){this.box(x,0.52,z,2.9,0.6,1.2,color);this.box(x-0.2,1.02,z,1.55,0.5,1.0,0x5c7779);for(const dx of [-0.85,0.85])for(const dz of [-0.63,0.63]){const wheel=this.cylinder(x+dx,0.28,z+dz,0.29,0.29,0.15,0x3e4740,10);wheel.rotation.x=Math.PI/2;}}
    clear(){this.root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o===this.flag)o.material.dispose();});while(this.root.children.length)this.root.remove(this.root.children[0]);this.animations=[];this.flag=null;}
    bake(){
      // Agrupa la geometría estática por material: cientos de objetos se dibujan en unas pocas llamadas.
      const T=this.T,batches=new Map(),meshes=[];this.root.updateMatrixWorld(true);
      this.root.traverse(o=>{if(!o.isMesh||o===this.flag)return;const source=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();source.applyMatrix4(o.matrixWorld);if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(source);meshes.push(o);});
      for(const o of meshes){o.parent.remove(o);o.geometry.dispose();}
      for(const [material,geometries]of batches){const positions=[],normals=[];for(const g of geometries){const p=g.attributes.position.array,n=g.attributes.normal.array;for(let i=0;i<p.length;i++)positions.push(p[i]);for(let i=0;i<n.length;i++)normals.push(n[i]);g.dispose();}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;this.root.add(mesh);}
    }
    buildCongress(){
      const T=this.T;this.box(0,-0.5,0,46,1,35,0xc8bca4);this.box(0,0.05,-9,24,0.2,9,0x8d6a50);this.box(0,0.45,-12,19,0.7,2,0x765740);
      this.box(0,1.3,-12,3,1,1.7,0x465f56);this.box(0,2,-13,14,0.4,1.2,0xb39365);
      for(let i=-4;i<=4;i++)this.box(i*2.8,1.1,-10,1.7,0.8,1.2,0x79694d);
      const seatColors=this.sim.s.parties.flatMap(p=>Array(p.seats).fill(p.color));let seat=0;
      for(let row=0;row<10;row++){
        const count=17+row*4;const radius=7.6+row*1.25;const h=row*0.27;
        for(let j=0;j<count&&seat<350;j++,seat++){
          const angle=-Math.PI*0.05+(j/(count-1))*Math.PI*1.1;const x=Math.cos(angle)*radius,z=Math.sin(angle)*radius-8;
          const group=new T.Group();group.position.set(x,h,z);group.rotation.y=-angle-Math.PI/2;this.root.add(group);
          this.box(0,0.6,0,0.75,0.18,0.8,seatColors[seat],group);this.box(0,1.03,0.3,0.75,0.85,0.15,seatColors[seat],group);this.box(0,0.9,-0.7,0.88,0.14,0.4,0xb39771,group);
        }
      }
      this.cylinder(0,0.3,-4,2.1,2.2,0.5,0x9d825e,30);this.box(0,1.2,-4,1.6,1.4,1,0x6c5742);
      // Asientos restantes en el fondo para conservar exactamente 350 representantes.
      while(seat<350){this.box((seat%20-10)*1.6,3.4,17,0.8,0.8,0.8,seatColors[seat]);seat++;}
    }
    buildEurope(){
      const T=this.T;const globe=new T.Mesh(new T.IcosahedronGeometry(11,3),this.mat(0x7d9e9d));globe.position.y=5;globe.castShadow=true;this.root.add(globe);
      const shapes=[[-1,11,8,4,4,2],[-5,7,8,3,4,2],[4,9,7,5,6,3],[-7,10,-4,5,3,3],[3,0,9,4,7,2],[8,6,3,4,5,3]];
      for(const [x,y,z,w,h,d]of shapes)this.sphere(x,y,z,w/2,0xa7b894,1,h/w,d/w+0.5);
      const ring=new T.Mesh(new T.TorusGeometry(14,0.08,6,80),this.mat(0xd5b777));ring.rotation.x=Math.PI/2.6;ring.position.y=5;this.root.add(ring);
      for(let j=0;j<12;j++){const a=j*Math.PI/6;this.sphere(Math.cos(a)*14,5+Math.sin(a)*6,Math.sin(a)*12,0.25,0xe6c987);}
      this.cylinder(0,-6.5,0,7,8,1,0x596f60,40);this.cylinder(0,-8,0,2,3,3,0x728b77,20);
    }
    setMode(mode){const seatStamp=this.sim.s.parties.map(p=>p.seats).join(',');if(!this.renderer||(mode===this.mode&&(mode!=='congress'||this.seatStamp===seatStamp)))return;this.seatStamp=seatStamp;this.mode=mode;this.clear();this.angle=mode==='congress'?1.35:0.72;this.zoom=1;this.elevation=mode==='congress'?0.9:0.65;if(mode==='congress')this.buildCongress();else if(mode==='europe')this.buildEurope();else this.buildPalace();this.bake();this.resize();}
    bind(){const el=this.renderer.domElement;
      el.addEventListener('pointerdown',e=>{this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});el.setPointerCapture(e.pointerId);this.drag=true;});
      el.addEventListener('pointermove',e=>{if(!this.pointers.has(e.pointerId))return;const old=this.pointers.get(e.pointerId);if(this.pointers.size===1){this.angle-=(e.clientX-old.x)*0.007;this.elevation=Math.max(0.25,Math.min(1.25,this.elevation+(e.clientY-old.y)*0.005));}else{const other=[...this.pointers.entries()].find(([id])=>id!==e.pointerId)?.[1];if(other){const before=Math.hypot(old.x-other.x,old.y-other.y),after=Math.hypot(e.clientX-other.x,e.clientY-other.y);this.zoom=Math.max(0.65,Math.min(1.75,this.zoom+(after-before)*0.004));}}
        this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.updateCamera();});
      for(const name of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(name,e=>{this.pointers.delete(e.pointerId);this.drag=this.pointers.size>0;});
      el.addEventListener('webglcontextlost',e=>{e.preventDefault();this.container.classList.add('context-lost');});el.addEventListener('webglcontextrestored',()=>this.container.classList.remove('context-lost'));
    }
    control(action){if(action==='reset'){this.angle=this.mode==='congress'?1.35:0.72;this.elevation=0.65;this.zoom=1;}else if(action==='left')this.angle-=0.25;else if(action==='right')this.angle+=0.25;else this.zoom=Math.max(0.65,Math.min(1.75,this.zoom+(action==='in'?0.12:-0.12)));if(this.renderer)this.updateCamera();}
    updateCamera(){if(!this.camera)return;const aspect=Math.max(0.5,this.container.clientWidth/Math.max(1,this.container.clientHeight));const size=(this.mode==='europe'?20:26)/this.zoom;this.camera.left=-size*aspect;this.camera.right=size*aspect;this.camera.top=size;this.camera.bottom=-size;this.camera.updateProjectionMatrix();const dist=75;this.camera.position.set(Math.cos(this.angle)*Math.cos(this.elevation)*dist,Math.sin(this.elevation)*dist,Math.sin(this.angle)*Math.cos(this.elevation)*dist);this.camera.lookAt(0,this.mode==='europe'?3:0.8,0);}
    resize(){if(!this.renderer)return;this.renderer.setSize(this.container.clientWidth,this.container.clientHeight,false);this.renderer.setPixelRatio(this.pixelRatio());this.updateCamera();}
    animate(time){if(this.flag&&this.sim.s.settings.motion){const pos=this.flag.geometry.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i);pos.setZ(i,Math.sin(time*2.5+x*2.2)*(x+1.2)*0.09);}pos.needsUpdate=true;}}
    dispose(){this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver?.disconnect();this.intersection?.disconnect();if(this.renderer){this.clear();for(const m of this.materials.values())m.dispose();this.renderer.dispose();this.renderer.domElement.remove();}}
  }
  G.PresidencyScene=PresidencyScene;
})(globalThis);

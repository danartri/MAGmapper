import {
    Mesh, 
    MeshStandardMaterial,
    PerspectiveCamera, 
     Scene, 
     Sprite, 
     SpriteMaterial, 
     TextureLoader,
     WebGLRenderer,
    Vector3,
    Geometry,
    LineBasicMaterial,
    Line,
    BufferGeometry
} from 'three';
import DragControls from 'three-dragcontrols';

import { DimensionTransformer, Dimension ,Edges, Mapper, UvMapper } from './Mapper';

import { Config } from '../../config';
import { VideoMaterial, VideoSceneHelper } from './VideoMaterial';

class LineBuilder{

    private static prepareEdges(edges: Dimension[]): Vector3[]{
        return [
            edges[0],
            edges[1],
            edges[3],
            edges[2],
            edges[0],
        ].map(edge => new Vector3(edge.x, edge.y, edge.z));
    }

    public static addLines(scene: Scene, id: string, edges: Dimension[]): Line{

        const material = new LineBasicMaterial({color: 255255255255255255, linewidth: Config.DragHandler.line}); 
        let geometry: Geometry = new Geometry();

        geometry.vertices = this.prepareEdges(edges);

        let line = new Line( geometry, material );
        line.name = id;
        return line
    }


    public static filterLines(scene, id: string): any[]{
        return scene.children
            .filter((child: any) => child.name === id && child.type === "Line")
    }

    public static reorderLines(scene, id: string, edges: Dimension[]){
        this.filterLines(scene, id)
            .map((child: any) => {
                child.geometry.vertices = this.prepareEdges(edges)
                child.geometry.verticesNeedUpdate = true; 
                return child;
            })
    }

    public static disable(line: Line, enable: boolean){
        line.visible = enable; 
        return line;
    }
}

class SpriteBuilder{
    public static generateDragHanldes(edges: Dimension[], source: string, scale: number): Sprite[]{
        return edges.map((edge: Dimension) => this.makeSprite(edge, source, scale));
    }

    public static makeSprite(point: Dimension, source: string, scale: number): Sprite {
 
        const texture = new TextureLoader().load(source);
    
        const material: SpriteMaterial = new SpriteMaterial({map: texture});
        let sprite: Sprite = new Sprite(material);

        sprite.position.set(point.x, point.y, point.z);
        sprite.scale.set(scale, scale, 1);
    
        return sprite;
    }


    public static loadSpriteEdges(scene: any, id: string){
        return scene.children
                .filter((obj) => obj.type === "Sprite" && obj.name == id)
                .map((obj) => DimensionTransformer.fromVector3D(obj.position));
    }

    public static disable(sprites: Sprite[], enable: boolean){
        sprites
            .map((sprite: Sprite) => {
                sprite.visible = enable; 
                return sprite;
            })
    }
}

export class DragHandler{
    private _id: string;

    private _sprites:  Sprite[];
    private _line: Line;

    private _edges: Dimension[];

    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera, id: string, positions: Dimension[]) {
        this._id = id;
        this._edges = Edges.getEdges(positions);
        this._sprites = SpriteBuilder
            .generateDragHanldes(this._edges, Config.DragHandler.source, Config.DragHandler.scale)
            .map((sprite: Sprite) => {
                scene.add(sprite);
                sprite.name = id;
                return sprite;
            });

        this._line = LineBuilder.addLines(scene, id, this._edges);
        scene.add(this._line);
    }

    public get sprites(){
        return this._sprites;
    }

    public get edges(){
        return this._edges;
    }

    public updateByVecotor(vector: Dimension){
        this._sprites.map((sprite: Sprite) => {
            sprite.position.setX(sprite.position.x + vector.x);
            sprite.position.setY(sprite.position.y + vector.y);
            return sprite;
        });

        let geo:any = this._line.geometry
         geo.vertices.map(vert =>{
            vert.x = vert.x + vector.x;
            vert.y = vert.y + vector.y;
            return vert;
        })
        geo.verticesNeedUpdate = true
    }

    public visibility(toggle: boolean): void{
        SpriteBuilder.disable(this.sprites, toggle);
        LineBuilder.disable(this._line, toggle);
    }
}

export class PositionDragHandler extends DragHandler {

    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera, id: string, positions: Dimension[]) {
        super(scene, renderer, camera, id, positions);

        new DragControls(super.sprites, camera, renderer.domElement)
            .addEventListener('drag', () => {
                this.loadPositions(id, scene, renderer, camera);
            });
    }

    private loadPositions(id: string, scene: any, renderer: WebGLRenderer, camera: PerspectiveCamera) {
        const spriteEdges: Dimension[] = SpriteBuilder.loadSpriteEdges(scene, id);

        LineBuilder.reorderLines(scene, id, spriteEdges);

        const vertices = Mapper.map(Config.Vertices.size, spriteEdges[0], spriteEdges[1], spriteEdges[2], spriteEdges[3])
        VideoSceneHelper.changeVertices(vertices, scene, id);

        renderer.render(scene, camera);
    }
}   

export class UvDragHandler extends DragHandler {

    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera, id: string, positions: Dimension[], targetId: string) {
        super(scene, renderer, camera, id, positions);

        new DragControls(super.sprites, camera, renderer.domElement)
            .addEventListener('drag', () => {
                this.loadPositions(id, scene, renderer, camera, this.edges, targetId);
            });
    }

    private loadPositions(id: string, scene: any, renderer: WebGLRenderer, camera: PerspectiveCamera, edges: Dimension[], targetId: string) {
        const spriteEdges: Dimension[] = SpriteBuilder.loadSpriteEdges(scene, id);
        LineBuilder.reorderLines(scene, id, spriteEdges);
        
        const uve:Dimension[] =  UvMapper.reorderUvMapping(spriteEdges, edges);
        VideoSceneHelper.changeUv(uve, scene, targetId);
        renderer.render(scene, camera);
    }
}

export class VideoMover {
    private startPoint: Dimension;
    private sprite: Sprite;

    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera, id: string, dragHandles: DragHandler[]){

        const positions = VideoSceneHelper.getEdgesFromScene(scene,id);

        const edges = Edges.getEdges(positions);
        
        const calcDelta = 
            (x1:number,x2: number): number =>
                (x2 - x1) / 2 + x1;

        this.startPoint = {
            x: calcDelta(edges[0].x ,edges[3].x),
            y: calcDelta(edges[0].y ,edges[3].y),
            z: 0
        };
        
        this.sprite = SpriteBuilder.makeSprite(this.startPoint, Config.DragHandler.source, Config.DragHandler.scale);
        scene.add(this.sprite)

        new DragControls([this.sprite], camera, renderer.domElement)
            .addEventListener('drag', (event) => {
                this.loadPositions(id, scene, event.object.position, renderer, camera, dragHandles);
            });
    }

    private loadPositions(id: string, scene: any, position: Dimension, renderer: WebGLRenderer, camera: PerspectiveCamera, dragHandles: DragHandler[]) {

        const delta = {
            x: position.x - this.startPoint.x,
            y: position.y - this.startPoint.y,
            z: 0
        }
        
        let oldVertices = VideoSceneHelper.filterVideoScene(scene, id)[0].geometry.attributes.position.array;
        const newVertices = DimensionTransformer.vectorizeFloatArray(oldVertices, delta);

        VideoSceneHelper.changeVerticesWithFloatArray(newVertices, scene, id);

        dragHandles.map(dragHandle => dragHandle.updateByVecotor(delta));

        // sets new position for proper delta (i know it is not a proper solution -.-)
        this.startPoint = {...position};

        renderer.render(scene, camera);
    }

    public visible(toggle: boolean){
        SpriteBuilder.disable([this.sprite], toggle);
    }
}
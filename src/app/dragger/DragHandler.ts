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

import { Mapper } from '../math/Mapper';

import { Config } from '../../config';
import { VideoSceneHelper } from '../material/VideoSceneHelper';
import { IDimension, DimensionTransformer } from '../math/DimensionTransformer';
import { Edges } from '../math/Edges';
import { UvMapper } from '../math/UvMapper';
import { SpriteBuilder } from '../material/SpriteBuilder';
import { LineBuilder } from '../material/LineBuilder';


export class DragHandler{
    private _id: string;

    private _sprites:  Sprite[];
    private _line: Line;

    private _edges: IDimension[];

    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera, id: string, positions: IDimension[]) {
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

    public updateByVecotor(vector: IDimension) {
        this._sprites.map((sprite: Sprite) => {
            sprite.position.setX(sprite.position.x + vector.x);
            sprite.position.setY(sprite.position.y + vector.y);
            return sprite;
        });

        let geo:any = this._line.geometry
         geo.vertices.map((vert) => {
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


import { IDimension } from "./DimensionTransformer";

export class Edges {
    public static isEdge(length: number, index: number): boolean {
        return index === 0 || 
               index === length - Math.sqrt(length) ||
               index === Math.sqrt(length) - 1 ||
               index === length - 1;
    }

    public static getEdges(vertices: IDimension[]): IDimension[] {
        return vertices.filter((_, i): boolean => this.isEdge(vertices.length, i));
    }
}
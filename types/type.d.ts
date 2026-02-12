declare interface Window {
  org_html_manager: any;
}

interface htmlNode {
  style: object
}

interface nodeInfo {
  id:string,
  name:string,
  children?:Array<nodeInfo>
}

interface nodeInfoMap {

}

type PageState = 'plain' | 'slide'


interface MyObject {
    [key: string]: any;
}

type ArrayLessThan2<T> = [] | [T];

import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_KEY = 'model'
let inputTag
let sceneManager
let model

window.onload = () => {
    inputTag = document.querySelector('input#file-input')
    inputTag.addEventListener('input', onInput)
    setupScene()
}

function onInput()
{
    let file = inputTag.files.item(0)
    let url = URL.createObjectURL(file)
    let assetLoader = new ENGINE.AssetLoader()
    assetLoader.addLoader(MODEL_KEY, url, new GLTFLoader())
    assetLoader.execute(p=>{}, map=>{
        loadModel(map)
        URL.revokeObjectURL(file)
    })
}

function setupScene()
{
    let canvas = document.querySelector('canvas#scene')
    sceneManager = new ENGINE.SceneManager(canvas)
    let input = new ENGINE.InputManager('Input', canvas)
    sceneManager.register(input)
    let cameraManager = new ENGINE.FirstPersonCameraManager('Camera', 50)
    cameraManager.registerInput(input)
    cameraManager.setPosition(0, 0, 5)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')
    let directLight = new ENGINE.DirectLight('DirectLight', new THREE.Color(1, 1, 1), 1)
    directLight.setPosition(-5, 2, 0)
    sceneManager.register(directLight)
}

function loadModel(assetMap)
{
    if (model != undefined)
        sceneManager.unregister(model.name)
    model = new ENGINE.MeshModel('Model', assetMap.get(MODEL_KEY), true)
    sceneManager.register(model)
}
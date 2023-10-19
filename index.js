import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_KEY = 'model'
const TEXTURE_KEY = 'texture'
let sceneManager
let /**@type {ENGINE.MeshModel}*/model
let assetLoader = new ENGINE.AssetLoader()
let textures = []
let textureUrls = []
let colorMenuContainer
let colorMenu

window.onload = () => 
{
    let modelInputTag = document.querySelector('input#model-input')
    modelInputTag.addEventListener('input', e => onModelInput(modelInputTag))
    let textureInputTag = document.querySelector('input#texture-input')
    textureInputTag.addEventListener('input', e => onTextureInput(textureInputTag))
    colorMenuContainer = document.getElementById('color-menu-outer')
    setupScene()
}

function onModelInput(modelInputTag)
{
    let filesCount = modelInputTag.files.length
    if (filesCount > 0)
    {
        let file = modelInputTag.files.item(0)
        let url = URL.createObjectURL(file)
        assetLoader.addLoader(MODEL_KEY, url, new GLTFLoader())
        assetLoader.execute(p=>{}, map=>{
            loadModel(map)
            URL.revokeObjectURL(file)
        })
    }
}

function loadModel(assetMap)
{
    if (model != undefined)
        sceneManager.unregister(model.name)
    model = new ENGINE.MeshModel('Model', assetMap.get(MODEL_KEY), true)
    if (sceneManager != undefined)
        sceneManager.register(model)
}

function onTextureInput(/**@type {HTMLInputElement}*/textureInputTag)
{
    let filesCount = textureInputTag.files.length
    for (let i=0; i<filesCount; i++)
    {
        let file = textureInputTag.files.item(i)
        let url = URL.createObjectURL(file)
        textureUrls.push(url)
        assetLoader.addLoader(TEXTURE_KEY+i, url, new THREE.TextureLoader())
    }
    assetLoader.execute(p=>{}, map=>{
        for (let i=0; i<filesCount; i++)
            textures.push(map.get(TEXTURE_KEY+i))
    })
    showTextureUI()
}

function setupScene()
{
    let canvas = document.querySelector('canvas#scene')
    sceneManager = new ENGINE.SceneManager(canvas)
    sceneManager.setBackground(new THREE.Color(0.1, 0.1, 0.1))
    let input = new ENGINE.InputManager('Input', canvas)
    sceneManager.register(input)
    let cameraManager = new ENGINE.OrbitalCameraManager('Camera', 50)
    cameraManager.setZoomSensitivity(0.1)
    cameraManager.registerInput(input)
    cameraManager.setPosition(0, 0, 5)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')
    let ambientLight = new ENGINE.AmbientLight('Ambient', new THREE.Color(1, 1, 1), 1)
    sceneManager.register(ambientLight)
}

function showTextureUI()
{
    if (colorMenu != undefined)
        colorMenuContainer.removeChild(colorMenu)
    colorMenu = document.createElement('div')
    colorMenu.id = 'color-menu'
    for (let i=0; i<textureUrls.length; i++)
    {
        let divElement = document.createElement('div')
        divElement.className = 'color-item-container'
        divElement.addEventListener('click', e=>onTextureClick(i))
        let imgElement = document.createElement('img')
        imgElement.id = 'color-item'+i
        imgElement.className = 'color-item'
        imgElement.src = textureUrls[i]
        divElement.appendChild(imgElement)
        colorMenu.appendChild(divElement)
    }
    colorMenuContainer.appendChild(colorMenu)
}

function onTextureClick(index)
{
    if (model != undefined && model != null)
        model.applyTexture(textures[index])
}
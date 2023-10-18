import { SceneObject } from './core/SceneManager.js'
import { Misc } from './helpers/misc.js'

/**
 * Responsible for notifying objects whenever user provides a mouse, touch or key input
 */
export class InputManager extends SceneObject
{ 
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {HTMLCanvasElement} canvas HTML canvas element
     */
    constructor(name, canvas)
    {
        super(name)
        this.keyEvent = new KeyEventCore()
        this.cursorEvent = new CursorEventCore(canvas)
    }

    /**
     * Registers key event callbacks
     * @param {Function} callback callback that is called whenever user presses a key in keyboard 
     */
    registerKeyEvent(callback) { this.keyEvent.callbacks.push(callback) }

    /**
     * Delegates call to KeyEventCore notify
     */
    notifyKeyEvent() { this.keyEvent.notify() }

    /**
     * Sets the mouse sensitivity value
     * @param {Number} sensitivity 
     */
    setCursorSensitivity(sensitivity)
    {
        if (sensitivity != null && sensitivity != undefined)
            this.cursorEvent.sensitivity = sensitivity
    }

    /**
     * Registers mouse lmb click callbacks
     * @param {Function} onClick callback that is called whenever user click on mouse
     */
    registerLMBClickEvent(onClick)
    {
        if (onClick != null && onClick != undefined)
            this.cursorEvent.clickCallbacks[0].push(onClick)
    }

    /**
     * Registers lmb hold movement callbacks
     * @param {Function} onMoveEvent callback that is called whenever the mouse or touch cursor is relocated
     */
    registerLMBMoveEvent(onMoveEvent)
    {
        if (onMoveEvent != null && onMoveEvent != undefined)
            this.cursorEvent.moveCallbacks[0].push(onMoveEvent)
    }

    /**
     * Registers lmb double click callbacks
     * @param {Function} onDblClick callback that is called whenever user double clicks on mouse
     */
    registerLMBDoubleClickEvent(onDblClick)
    {
        if (onDblClick != null && onDblClick != undefined)
            this.cursorEvent.dblClickCallbacks[0].push(onDblClick)
    }

    /**
     * Registers mouse rmb click callbacks
     * @param {Function} onClick callback that is called whenever user clicks lmb button
     */
    registerRMBClickEvent(onClick)
    {
        if (onClick != null && onClick != undefined)
            this.cursorEvent.clickCallbacks[2].push(onClick)
    }

    /**
     * Registers rmb hold movement callbacks
     * @param {Function} onMoveEvent callback that is called whenever the user holds lmb button
     */
    registerRMBMoveEvent(onMoveEvent)
    {
        if (onMoveEvent != null && onMoveEvent != undefined)
            this.cursorEvent.moveCallbacks[2].push(onMoveEvent)
    }

    /**
     * Registers rmb double click callbacks
     * @param {Function} onDblClick callback that is called whenever the user double clicks lmb button
     */
    registerRMBDoubleClickEvent(onDblClick)
    {
        if (onDblClick != null && onDblClick != undefined)
            this.cursorEvent.dblClickCallbacks[2].push(onDblClick)
    }

    /**
     * Registers touch tap callbacks
     * @param {Function} onTap callback that is called whenever user click on mouse
     */
    registerTouchTapEvent(onTap)
    {
        if (onTap != null && onTap != undefined)
            this.cursorEvent.clickCallbacks[3].push(onTap)
    }

    /**
     * Registers touch movement callbacks
     * @param {Function} onTouchMove callback that is called whenever the mouse or touch cursor is relocated
     */
    registerTouchMoveEvent(onTouchMove)
    {
        if (onTouchMove != null && onTouchMove != undefined)
            this.cursorEvent.moveCallbacks[3].push(onTouchMove)
    }

    /**
     * Registers touch double tap callbacks
     * @param {Function} onDblTap callback that is called whenever user double clicks on mouse
     */
    registerTouchDoubleTapEvent(onDblTap)
    {
        if (onDblTap != null && onDblTap != undefined)
            this.cursorEvent.dblClickCallbacks[3].push(onDblTap)
    }

    /**
     * Registers mouse wheel callbacks
     * @param {Function} onWheelMove callback that is called whenever user moves the mouse wheel
     */
    registerMouseWheelEvent(onWheelMove)
    {
        if (onWheelMove != null && onWheelMove != undefined)
            this.cursorEvent.wheelCallbacks.push(onWheelMove)
    }

    /**
     * Called by SceneManager every frame.
     * This function delegates call to KeyEventCore notify
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneRender(sceneManager) { this.keyEvent.notify() }
}

/**
 * Responsible for detecting and notifying mouse and touch events
 */
class CursorEventCore
{
    /**
     * 
     * @param {HTMLCanvasElement} canvas html canvas element
     */
    constructor(canvas)
    {
        this.enable = true
        this.firstClicks = [true, true, true, true]
        this.lastXY = { x: 0, y: 0 }
        this.sensitivity = 1
        this.clickCallbacks = [[],[],[],[]]
        this.moveCallbacks = [[],[],[],[]]
        this.dblClickCallbacks = [[],[],[],[]]
        this.wheelCallbacks = []
        this.buttonPresses = [false, false, false, false]
        this.buttonDblTapCounter = [0, 0, 0, 0]
        this.registerCanvasEvents(canvas)
    }

    /**
     * Registers event listeners to the canvas element that is passed.
     * @param {HTMLCanvasElement} canvas html canvas element
     */
    registerCanvasEvents(canvas)
    {
        document.addEventListener('contextmenu', e=>event.preventDefault())
        canvas.addEventListener('mousedown', e=>this.onButtonPress(e))
        canvas.addEventListener('mouseup', e=>this.onButtonRelease(e))
        canvas.addEventListener('mousemove', e=>this.onCursorMove(e))
        canvas.addEventListener('touchstart', e=>this.onButtonPress(e))
        canvas.addEventListener('touchend', e=>this.onButtonRelease(e))
        canvas.addEventListener('touchmove', e=>this.onCursorMove(e))
        canvas.addEventListener('wheel', e=>this.onMouseWheelRoll(e))
    }

    /**
     * Called whenever user presses the mouse button or touches the screen.
     * This function sets the mousePress flag to true and notifies all the registered double click callbacks
     * on detecting double taps.
     * @param {Event} event mouse or touch event object
     */
    onButtonPress(event) 
    { 
        let isDevice = Misc.isHandHeldDevice()
        if ((isDevice && event.type == 'touchstart') || (!isDevice && event.type == 'mousedown'))
        {
            let callbackIndex
            if (event.type == 'touchstart')
            {    
                event = event.touches[0]
                callbackIndex = 3
            }
            else
                callbackIndex = event.which - 1
            this.buttonPresses[callbackIndex] = true 
            this.buttonDblTapCounter[callbackIndex] = this.buttonDblTapCounter[callbackIndex] + 1
            if (this.buttonDblTapCounter[callbackIndex] > 2)
                this.buttonDblTapCounter[callbackIndex] = 2   
            if (this.buttonDblTapCounter[callbackIndex] == 1)
            {
                setTimeout(()=>{
                    if (this.buttonDblTapCounter[callbackIndex] > 1)
                    {
                        let callbacks = this.dblClickCallbacks[callbackIndex]
                        for (let dblClickCallback of callbacks)
                            dblClickCallback(event)
                    }
                    else
                    {
                        let callbacks = this.clickCallbacks[callbackIndex]
                        for (let clickCallback of callbacks)
                            clickCallback(event.clientX, event.clientY)
                    }
                    this.buttonDblTapCounter[callbackIndex] = 0
                }, 250) 
            }
        }  
    }

    /**
     * Called whenever user releases the mouse button or touches the screen.
     * This function sets the mousePress flag to false and firstClick value to true
     * and also resets the value of lastXY object.
     * @param {Event} event mouse or touch event object
     */
    onButtonRelease(event)
    {
        this.buttonPresses[event.which - 1] = false
        this.firstClicks[event.which - 1] = true
        this.lastXY = { x: 0, y: 0 }
    }

    /**
     * Called whenever the mouse or touch cursor is relocated.
     * If there are registered move callbacks and if the mousePress is true, then this function will 
     * calculate the displacement of the cursor and call the callbacks by providing the displacement
     * as well as the cursor positions.
     * @param {Event} event mouse or touch event object
     */
    onCursorMove(event)
    {
        let callbackIndex
        if (event.type == 'touchmove') 
            callbackIndex = 3
        else
            callbackIndex = event.which - 1
        if (callbackIndex >= 0 && callbackIndex < this.moveCallbacks.length)
        {
            let callbacks = this.moveCallbacks[callbackIndex]
            if (callbacks.length > 0 && this.buttonPresses[callbackIndex])
            {    
                if (event.type == 'touchmove') 
                    event = event.touches[0]
                if (this.firstClicks[event.which - 1])
                {
                    this.lastXY = { x: event.clientX, y: event.clientY }
                    this.firstClicks[event.which - 1] = false
                }
                this.currentXY = { x: event.clientX, y: event.clientY }
                let deltaX = (this.currentXY.x - this.lastXY.x) * this.sensitivity
                let deltaY = (this.currentXY.y - this.lastXY.y) * this.sensitivity
                let callbacks = this.moveCallbacks[callbackIndex]
                for (let moveCallback of callbacks)
                    moveCallback(deltaX, deltaY, event.clientX, event.clientY)
                this.lastXY = this.currentXY
            }
        }
    }

    /**
     * Called by canvas event listener whenever it detects a mouse double click.
     * This function notifies all the registered double click callbacks.
     * @param {MouseEvent} event mouse event object
     */
    onDblClick(event)
    {
        let callbacks = this.dblClickCallbacks[event.which - 1]
        for (let dblClickCallback of callbacks)
            dblClickCallback(event)
    }

    /**
     * Called whenever the mouse wheel is rolled.
     * @param {Event} event mouse wheel event
     */
    onMouseWheelRoll(event)
    {
        if (this.wheelCallbacks.length > 0)
        {    
            for (let wheelCallback of this.wheelCallbacks)
                wheelCallback(event.deltaY/100)
        }
    }
}

/**
 * Responsible for detecting and notifying key events
 */
class KeyEventCore
{
    constructor()
    {
        this.keyMap = new Map()
        this.callbacks = []
        window.addEventListener("keydown", e=>this.onDown(e))
        window.addEventListener("keyup", e=>this.onUp(e))
    }

    /**
     * Called by window whenever it detects a key press.
     * This function stores the key in keymap
     * @param {KeyboardEvent} event 
     */
    onDown(event)
    {
        let entry = this.keyMap.get(event.key)
        if (entry == null || entry == undefined)
            this.keyMap.set(event.key, true)
    }

    /**
     * Called by window whenever it detects a key release.
     * This function remove the key from keymap
     * @param {KeyboardEvent} event 
     */
    onUp(event)
    {
        let entry = this.keyMap.get(event.key)
        if (entry != null && entry != undefined)
            this.keyMap.delete(event.key)
    }

    /**.
     * This function calls all the keyevent callbacks on every frame
     */
    notify()
    {
        for (let callback of this.callbacks)
            callback(this.keyMap)
    }
}
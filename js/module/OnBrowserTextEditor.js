/**
 * @typedef {Object} TextEditorDOM
 * @property {HTMLElement} wrapper a div wrapping all the elements
 * @property {HTMLHeadingElement} title
 * @property {HTMLTextAreaElement} textarea
 * @property {HTMLElement} notifyArea
 * @property {HTMLButtonElement} saveButton
 * @property {HTMLButtonElement} loadButton
 */

/*
Direction of save/load

[ Editor ]<-Load[  HTML  ]      [  Local  ]
[        ]Save->[ Active ]      [ Storage ]
[        ]      [ Config ]Save->[         ]
*/

/**
 * Create a textarea and a set of buttons to give access to the text
 * @class
 */
class OnBrowserTextEditor {
  constructor () {
    this.dataTitle = ''
    this.reference = {
      data: null,
      callback: null,
      raw: false
    }
    this.makeDomStructure()
    
    this.buttonProtectionDuration = 500
    this.visibilityTimerID = 0
    this.buttonProtectionTimerID = 0
  }
  
  makeDomStructure () {
    const title = document.createElement('b')
    title.setAttribute('class', 'title')
    const closeButton = document.createElement('button')
    closeButton.classList.add('close')
    closeButton.textContent = '　　X　　'
    const textarea = document.createElement('textarea')
    textarea.setAttribute('class', 'after-margin')
    const notifyArea = document.createElement('div')
    notifyArea.setAttribute('id', 'notify-area')
    notifyArea.setAttribute('class', 'no-divider')
    const buttonDiv = document.createElement('div')
    const saveButton = document.createElement('button')
    saveButton.textContent =
      'Save Current Text as Configuration'
    const loadButton = document.createElement('button')
    loadButton.textContent =
      'Load Current Configuration'
    const oneEmptySpaceLetter = document.createElement('span')
    oneEmptySpaceLetter.innerText = ' '
    buttonDiv.appendChild(saveButton)
    buttonDiv.appendChild(oneEmptySpaceLetter)
    buttonDiv.appendChild(loadButton)
  
    closeButton.addEventListener('click', () => {this.visibility = false})
    saveButton.addEventListener('click', this.saveFromEditor.bind(this))
    loadButton.addEventListener('click', this.loadToEditor.bind(this))
  
    const wrapper = document.createElement('div')
    wrapper.setAttribute('id', 'text-editor-wrapper')
    wrapper.appendChild(title)
    wrapper.appendChild(closeButton)
    wrapper.appendChild(textarea)
    wrapper.appendChild(notifyArea)
    wrapper.appendChild(buttonDiv)
    
    this.dom = {
      wrapper, title, textarea, notifyArea, buttonDiv, saveButton, loadButton
    }
  }
  
  appendToParent (parentDom, insertAfterThisDom) {
    if (insertAfterThisDom) {
      parentDom.insertBefore(this.dom.wrapper, insertAfterThisDom.nextSibling)
    } else {
      parentDom.appendChild(this.dom.wrapper)
    }
  }
  
  set visibility (state) {
    if (typeof state === 'boolean') {
      if (state) {
        this.dom.wrapper.classList.add('active')
        this.dom.wrapper.classList.remove('inactive')
      } else {
        this.dom.wrapper.classList.add('inactive')
        this.dom.wrapper.classList.remove('active')
      }
    } else {
      this.dom.wrapper.classList.toggle('active')
      this.dom.wrapper.classList.toggle('inactive')
    }
    /*
     this prevents accidental double clicks
     where the second one actually reaching a button
     before the user recognize the button appearing.
     */
    if (this.dom.wrapper.classList.contains('active')) {
      const buttons = Array.from(
        this.dom.buttonDiv.getElementsByTagName('button')
      )
      if (this.buttonProtectionTimerID) {
        clearTimeout(this.buttonProtectionTimerID)
      }
      buttons.forEach(b => {
        b.setAttribute('disabled', '')
      })
      this.buttonProtectionTimerID =
        setTimeout(buttons => {
          buttons.forEach(b => {
            b.removeAttribute('disabled')
          })
        }, this.buttonProtectionDuration, buttons)
    }
  }
  
  static announceMessage = MPCommon.announceMessageFrom('On-Browser Text Editor')
  
  /**
   * Change the data the editor is 'focusing' on.
   *
   * @param {string} title Visible title text on the editor.
   * @param {Object} dataRef *Reference* to the data the editor should be dealing with.
   * @param {callback} callback The actual function to process the data referred by `dataRef`.
   * The editor will hold on the reference and the callback can't update the reference.
   * So it's required for the callback to not change the reference to the data.
   * If it failed to follow it, the 'load button' of the editor will load the data
   * before it is changed by the callback, until the editor get to 'change the focus' again
   * and to update the reference stored in it.
   * @param {boolean} [raw=false] Display data without converting it to JSON if set to true.
   * @param {boolean} [nospace=false] Display data with spaces and newlines omitted.
   * @param {string} [type='object'] tells the type of the data
   */
  changeFocus (
    title, dataRef, callback, {raw, nospace, type} = {
      raw: false, nospace: false, type: 'object'
    }) {
    this.dataTitle = title
    this.dom.title.innerText = title
    this.reference.data = dataRef
    this.reference.callback = callback
    this.reference.format = { raw, nospace, type }
    if (!callback) {
      setTimeout(() => {
        this.dom.saveButton.setAttribute('disabled', '')
      }, this.buttonProtectionDuration + 1)
    }
    this.loadToEditor()
    this.visibility = true
  }
  
  saveFromEditor () {
    if (!this.reference.callback) {
      this.notify('There\'s no save function assigned!', true)
      return false
    }
    OnBrowserTextEditor.announceMessage(`Saving ${this.dataTitle} from the editor...`)
    try {
      const format = this.reference.format
      let dataToStore
      // define the data to show in regard to given type
      switch (format.type) {
        case 'map':
          dataToStore = new Map(JSON.parse(this.dom.textarea.value || null))
          break
        case 'object':
        default:
          dataToStore = JSON.parse(this.dom.textarea.value || null)
          break
      }
      // first need to bind the callback to the instance they're from
      const result = this.reference.callback(dataToStore)
      if (result === true) {
        this.notify('Data are saved.')
        OnBrowserTextEditor.announceMessage(`Saved ${this.dataTitle} from the editor.`)
      } else {
        this.notify('Data weren\'t accepted! Check the error log.')
        OnBrowserTextEditor.announceMessage(new Error(JSON.stringify(result)))
      }
    } catch (e) {
      this.notify('Data can\'t be saved. Check the error log.', true)
      OnBrowserTextEditor.announceMessage(e)
    }
  }
  loadToEditor () {
    OnBrowserTextEditor.announceMessage(`Loading ${this.dataTitle} to the editor...`)
    try {
      const format = this.reference.format
      let dataToConvert
      // define the data to show in regard to given type
      switch (format.type) {
        case 'map':
          dataToConvert = [...this.reference.data]
          break
        case 'object':
        default:
          dataToConvert = this.reference.data
          break
      }
      // put the data to the textarea
      this.dom.textarea.value =
        format.raw ? dataToConvert :
          format.nospace ? JSON.stringify(dataToConvert) :
            JSON.stringify(dataToConvert, null, 2)
      
      this.notify('Data are loaded.')
      OnBrowserTextEditor.announceMessage(`Loaded ${this.dataTitle} to the editor.`)
    } catch (e) {
      this.notify('Data can\'t be read! Check the error log.', true)
      OnBrowserTextEditor.announceMessage(e)
    }
  }
  
  /**
   * accepts the message info and change the notification area class name for a brief time.
   *
   * @param {string} message
   * @param {boolean} isError
   */
  notify (message, isError = false) {
    this.dom.notifyArea.classList.add('visible')
    if (isError) {
      this.dom.notifyArea.classList.add('error')
    }
    this.dom.notifyArea.innerText = message
    if (this.visibilityTimerID) {
      clearTimeout(this.visibilityTimerID)
    }
    this.visibilityTimerID = setTimeout(area => {
      area.classList.remove('visible')
      area.classList.remove('error')
    }, 4000, this.dom.notifyArea)
  }
}

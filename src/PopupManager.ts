class PopupManager {

  // 确保每次只有一个弹窗
  popupArr: ArrayLessThan2<string> = [];

  constructor() {
    this.init();
  }

  init() {
    // document.addEventListener('keydown', (e) => {
    //   if (e.key === 'Escape' || e.keyCode === 27) {
    //     this.closePopup();
    //   }
    // });
  }

  closePopup() {
    if (this.popupArr.length === 0) {
      return;
    }
    const id = this.popupArr.pop();
    if (!id) {
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
    }
  }

  openPopup(id: string, callback?: Function | undefined) {
    if (!id) {
      return;
    }
    if (this.popupArr.length > 0) {
      this.closePopup()
    }
    const element = document.getElementById(id);
    if (element) {
      this.popupArr[0] = id;
      element.style.display = 'block';
      if (callback) {
        callback()
      }
    }
  }

  getPopupId () {
    if (this.popupArr.length === 0) { return '' }
    return this.popupArr[0]
  }
}

export default PopupManager

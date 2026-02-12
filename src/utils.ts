import { 
  tagRegex,
  helpInfoArr,
  containerIdPrefix,
  clickElementClassNames,
} from './constant';

function decodeHTMLEntities(text:string) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export const createInnerHtml = (label: string, shortcuts: string) => {
  return (
    "<span style='float:left;'>" +
    label +
    '</span>' +
    "<span style='float:right;color:#aaaaaa;font-weight:normal;'>(" +
    shortcuts +
    'RET to close)</span>'
  );
};

export const trim = (s: string) => {
  return s.replace(/^\s+|\s+$/g, '');
};

export const removeTags = (s: string) => {
  if (s) {
    while (s.match(tagRegex)) {
      s = s.substring(0, s.indexOf('<')) + s.substring(s.indexOf('>') + 1);
    }
  }
  return s;
};

const addPopup = (id:string, content:string) => {
  const div = document.createElement('div');
  div.id = id;
  div.className = 'popup-container';
  div.innerHTML = '<div class="popup-content">' + content + '</div>'
  div.style.display = 'none';
  document.body.appendChild(div);
};

/**
 * 生成帮助弹窗，添加到body中
 */
export const createHelpNode = (id: string) => {
  let content = '';
  helpInfoArr.forEach((help) => {
    let temp = '<tbody>';
    temp += '<tr><td></td><td><b>' + help.title + '</b></td></tr>';

    help.children.forEach((child) => {
      temp +=
        '<tr><td><b>' + child.key + '</b></td><td>' + child.desc + '</td></tr>';
    });

    temp += '</tbody>';
    content += temp;
  });
  const str =
    '<h2>Keyboard Shortcuts</h2>' +
    '<table cellpadding="3" rules="groups" frame="hsides" style="" border="0";>' +
    content +
    '</table>'
  addPopup(id, str)
};

export const createOccurNode = (id:string) => {
  let str = `
  <div class="search-box">
    <input id="occur-input" />
  </div>
  `
  str += `
    <div class="search-result-box" id="occur-result">
    </div>
  `
  addPopup(id, str)
}


/**
 * 生成搜索弹窗
 * @param id 搜索弹窗页面元素id
 */
export const createSearchNode = (id: string) => {
  let str = `
  <div class="search-box">
    <input id="search-input" />
  </div>
  `
  str += `
    <div class="search-result-box" id="search-result">
    </div>
  `
  addPopup(id, str)
};

export const selectItem = (elementArr:HTMLCollection, index:number) => {
  if (elementArr.length === 0) { return }
  for (let i = 0, len = elementArr.length; i < len; i++) {
    const e = elementArr[i]
    e.classList.remove('selected')
    if (i === index) {
      e.classList.add('selected')
    }
  }
}

export const createTags = (element:HTMLElement, tags:MyObject) => {
  let str = ''
  Object.keys(tags).forEach(key => {
    str +=`
      <span class="tag ${clickElementClassNames.tag}" data-tag="${key}">${key}(${tags[key]})</span>
    `
  })
  element.innerHTML = str
}

export const clearSelectedTags = () => {
  const selectedTags = document.querySelectorAll('.tag.selected')
  for (let i = 0, length = selectedTags.length; i < length; i++) {
    selectedTags[i].classList.remove('selected')
  }
}

export const createTagSearchNode = (id:string) => {
  let str = `
  <div class="search-box" id="tag-list-box"></div>
  `
  str += `
    <div class="search-result-box" id="tag-search-result">
    </div>
  `
  addPopup(id, str)
}

export const generateInfo = (ul: HTMLElement, parentId?:string, level?:number, info?:MyObject, arr?:Array<MyObject>) => {
  parentId = parentId || ''
  level = level || 0
  info = info || {}
  arr = arr || []

  const liArr = ul.children
  if (!liArr || liArr.length === 0) {
    return {
      obj: info,
      arr: arr,
    }
  }

  for (let i = 0, len = liArr.length; i < len; i++) {
    const li = liArr[i];
    const a = li.querySelector('a') as HTMLElement;
    let id = a.getAttribute('href') || '';
    id = id.replace('#', '')
    const name = trim(a.innerHTML);

    const tagElements = a.querySelectorAll('.tag span')
    let tags = []
    if (tagElements) {
      for(let i = 0, length = tagElements.length; i < length; i++) {
        const e = tagElements[i]
        console.log(trim(e.innerHTML))
        tags.push(trim(e.innerHTML))
      }
    }

    const containerId = containerIdPrefix + id
    const element = document.getElementById(containerId)
    let top = 0
    if (element) {
      top = element.getBoundingClientRect().top + document.documentElement.scrollTop
    }

    const ul = li.querySelector('ul') as HTMLElement;

    info[id] = {
      name: removeTags(decodeHTMLEntities(name)),
      top,
      containerId,
      container: element,
      parentId,
      level,
      isLeaf: !ul, // true表示没有子节点
      tags,
    }

    arr.push({
      id,
      ...info[id],
    })

    if (ul) {
      generateInfo(ul, id, level + 1, info, arr)
    }
  }

  return {
    obj: info,
    arr: arr,
  }
}

export const addBackToTopButton = () => {
  const container = document.querySelector('body') as HTMLElement;
  const button = document.createElement('span');
  button.setAttribute('id', 'back-to-top');
  button.innerHTML = 'Top'
  container.appendChild(button)
  button.addEventListener('click', function(e) {
    const href = location.href.split('#')[0] + '#';
    location.href = href;
  })
}

let notificationBox:HTMLElement;
let notificationTitle:HTMLElement;
let notificationContent:HTMLElement;
let notificationClose:HTMLElement;
export const createNotificationNode = () => {
  const div = document.createElement('div');
  div.className = 'notification-box';
  div.id = 'notification-box';
  div.innerHTML = `
    <div class="notification-header">
      <div class="notification-title click-copy">测试标题</div>
      <div class="notification-close click-close-notification">x</div>
    </div>
    <div class="notification-content click-copy">测试内容</div>
  `
  div.style.left = '-400px';
  document.body.appendChild(div);

  notificationBox = document.getElementById('notification-box') as HTMLElement;
  notificationTitle = notificationBox.querySelector('.notification-title') as HTMLElement
  notificationContent = notificationBox.querySelector('.notification-content') as HTMLElement
}

export const showNotification = (title:string, msg:string, isKeep?:boolean | undefined) => {
  isKeep = isKeep || false
  notificationTitle.innerHTML = title
  notificationContent.innerHTML = msg
  notificationBox.style.left = '0'
  if (!isKeep) {
    setTimeout(() => {
      closeNotification()
    }, 5000)
  }
}

export const closeNotification = () => {
  notificationBox.style.left = '-400px'
}

export const copyTextToClipboard = (text:string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

let msgBox:HTMLElement;
export const createMsgNode = () => {
  const div = document.createElement('div');
  div.className = 'msg-box';
  div.id = 'msg-box';
  div.innerHTML = ``
  document.body.appendChild(div);
  msgBox = document.getElementById('msg-box') as HTMLElement
}

export const showMsg = (msg:string) => {
  msgBox.innerHTML = msg
  msgBox.style.opacity = '1'
  setTimeout(() => {
    msgBox.style.opacity = '0'
  }, 3000)
}
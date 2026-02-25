import {
  addBackToTopButton,
  createHelpNode,
  createSearchNode,

  createTagSearchNode,
  createTags,
  clearSelectedTags,

  createOccurNode,
  generateInfo,
  selectItem,

  createNotificationNode,
  showNotification,
  closeNotification,

  createMsgNode,
  showMsg,

  copyTextToClipboard,
} from './utils'


import {
  containerIdPrefix,
  popupIdInfo,
  clickElementClassNames
} from './constant'

import PopupManager from './PopupManager'
const popupManager = new PopupManager()

const scrollTo = (top:number, option?:MyObject) => {
  document.documentElement.scrollTo({
    top,
    behavior: (option ? option.behavior : '') || 'smooth'
  })
}

/**
 * 根据id，页面跳转至相应元素
 * @param {string} nodeId 节点ID
 */
const jumpToNodeById = (nodeId:string) => {
  popupManager.closePopup()
  const node = pageNodeInfo[nodeId]
  const top = node.top
  scrollTo(top + 4) // 稍微多滚动一点，触发 document scroll 中的判断逻辑
}

/**
 * 在节点访问历史记录中“前进”或“后退
 * 如果是通过搜索结果跳转,那么清空"前面"的记录
 * @param {boolean} isForward 是否前进
 * @param {string} nodeId 前进时的节点ID
 */
const moveInHistory = (isForward:boolean, nodeId?:string) => {
  if (isForward) {
    if (nodeId) {
      nodeHistory.length = nodeHistoryIndex + 1 //  < 0 ? 0 : nodeHistoryIndex
      nodeHistory.push(nodeId)
      nodeHistoryIndex++
      jumpToNodeById(nodeId)
    } else {
      if (nodeHistoryIndex === nodeHistory.length - 1) {
        showMsg('到头了')
        return
      }
      if (nodeHistoryIndex < nodeHistory.length - 1) {
        nodeHistoryIndex++
      }
      jumpToNodeById(nodeHistory[nodeHistoryIndex])
    }
  } else {
    // 向后时不需要清除访问历史记录
    if (nodeHistoryIndex <= 0) {
      showMsg('到头了')
      return
    }

    if (nodeHistoryIndex > 0) {
      nodeHistoryIndex--
    }
    jumpToNodeById(nodeHistory[nodeHistoryIndex])
  }
}

const getPrevNode = (nodeId:string) => {
  const index = pageNodeArr.findIndex(i => i.id === nodeId)
  if (index === 0) {
    return null
  }
  return pageNodeArr[index - 1]
}

const getNextNode = (nodeId:string) => {
  const index = pageNodeArr.findIndex(i => i.id === nodeId)
  if (index === pageNodeArr.length - 1) {
    return null
  }
  return pageNodeArr[index + 1]
}

let pageNodeInfo:MyObject = {};

let pageNodeArr:Array<MyObject> = [];

let pageTags:MyObject = {};

/**
 * 记录节点访问历史记录
 */
let nodeHistory:Array<string> = [];

/**
 * 当前节点在访问历史记录中的索引
 * 通过 b / f 操作页面时定位
 */
let nodeHistoryIndex:number = -1;

/**
 * 当前页面的显示状态
 * 0 正常页面
 */
let pageState:PageState = 'plain'

/**
 * 是否正在显示帮助信息
 */
let isShowHelp = false;

/**
 * 记录搜索关键字，用于按键S
 */
let currentSearchWord:string = '';

/**
 * 标题搜索弹窗中搜索输入框对应的页面元素
 */
let searchInput:HTMLInputElement;

/**
 * 标题搜索弹窗中搜索结果列表对应的页面元素
 */
let searchResult:HTMLElement;

/**
 * 标题搜索弹窗中显示的搜索结果列表
 */
let searchResultArr:Array<MyObject> = []

/**
 * 标题搜索弹窗中显示的搜索结果列表选中项的索引
 */
let searchResultSelectedIndex: number = 0


/**
 * tag搜索弹窗
 */
let tagListbox:HTMLElement;
let selectedTags:string[] = [];
let tagSearchResult:HTMLElement;
let tagSearchResultArr:Array<MyObject> = []
let tagSelectedIndex: number = 0

/**
 * 当前视图内显示的第一个节点的containerID
 */
let curContainerId:string = ''

/**
 * 目录部分
 */
let tableOfContent:HTMLElement;
let showTableOfContent = true

/**
 * 主要内容
 */
let mainContent:HTMLElement;

/**
 * 帮助信息
 */
let helpInfo: HTMLElement;

/**
 * 底部作者信息和时间
 */
let postamble: HTMLElement;

/**
 * 输入框
 */
let consoleBox:HTMLElement;

/**
 * 全局节点信息
 */
let nodeInfoArr:Array<nodeInfo>;

/**
 * 全局节点信息
 * 标题内容: [id, 标题的层级信息]
 */
// let nodeInfoMap:{[key:string]: any};

// 记录当前所在的节点位置，该位置是显示输入框的父节点
let currentSection:HTMLElement;

// 记录需要操作的指令
let currentKey:string;

document.addEventListener('DOMContentLoaded', function() {
  init();

  tableOfContent = document.querySelector('#table-of-contents') as HTMLElement;
  // mainContent = document.getElementById('content') as HTMLElement;
  helpInfo = document.getElementById(popupIdInfo.help) as HTMLElement;
  // postamble = document.getElementById('postamble') as HTMLElement;

  const ul = document.querySelector('#text-table-of-contents ul') as HTMLElement;
  const info = generateInfo(ul)
  pageNodeInfo = info.obj
  pageNodeArr = info.arr
  info.arr.forEach(item => {
    const tags = item.tags
    if (tags.length > 0) {
      tags.forEach((tag:string) => {
        pageTags[tag] = pageTags[tag] ? pageTags[tag] + 1 : 1
      })
    }
  })

  curContainerId = pageNodeArr[0].containerId

  nodeHistory = [pageNodeArr[0].id]
  nodeHistoryIndex = 0

  searchInput = document.getElementById('search-input') as HTMLInputElement
  searchResult = document.getElementById('search-result') as HTMLElement
  handleSearchInputKeyBinding()

  // tagSearchInput = document.getElementById('tag-search-input') as HTMLInputElement
  tagListbox = document.getElementById('tag-list-box') as HTMLElement
  createTags(tagListbox, pageTags)
  tagSearchResult = document.getElementById('tag-search-result') as HTMLElement

  // createObserver(pageNodeArr, pageNodeInfo);
})

/**
 * 绑定标题搜索弹窗中输入框的事件
 */
const handleSearchInputKeyBinding = () => {
  searchInput.addEventListener('input', function(v) {
    searchResult.innerHTML = ''
    currentSearchWord = searchInput.value
    const reg = new RegExp(currentSearchWord, 'i')
    const keyArr = Object.keys(pageNodeInfo)
    searchResultArr = keyArr.filter((key:string) => {
      const name = pageNodeInfo[key].name.toLowerCase()
      return name.indexOf(currentSearchWord.toLowerCase()) > -1
    }).map((key:string) => {
      const item = pageNodeInfo[key]
      const match = item.name.match(reg)[0]
      return {
        id: key,
        ...item,
        content: item.name.replace(match, '<span class="search-match">' + match + '</span>')
      }
    })

    searchResult.innerHTML = generateSearchResult(searchResultArr)
    if (searchResultArr.length > 0) {
      searchResultSelectedIndex = 0
      selectItem(searchResult.getElementsByClassName('search-result-item'), searchResultSelectedIndex)
    }
  });
}

/**
 * 生成标题搜索弹窗中搜索结果部分的内容
 * @param resultArr 搜索匹配的节点信息
 * @returns
 */
const generateSearchResult = (resultArr:Array<MyObject>) => {
  return resultArr.map((item, index) => {
    if (index < 9) {
      return `
        <div class="search-result-item" data-nodeid="${item.id}">
          <div class="shortcut-key">Ctrl + ${index + 1}</div>
          <div class="search-result-item-content">${item.content}</div>
        </div>
      `
    } else {
      return `
        <div class="search-result-item" data-nodeid="${item.id}">
          <div class="shortcut-key"></div>
          <div class="search-result-item-content">${item.content}</div>
        </div>
      `
    }

  }).join('')
}

/**
 * 初始化页面
 */
const init = () => {
  createHelpNode(popupIdInfo.help);
  createSearchNode(popupIdInfo.search);
  createTagSearchNode(popupIdInfo.tagSearch);
  createOccurNode(popupIdInfo.occur);
  createNotificationNode()
  createMsgNode();
  // addBackToTopButton();
}

/**
 * 处理标题搜索弹窗中的按键事件
 * @param key 键值
 * @param e keyup事件对象
 */
const handleSearchPopupKeyup = (key:string, e:KeyboardEvent) => {
  const size = searchResultArr.length
  const isCtrlKey = e.ctrlKey
  if (isCtrlKey) {
    if (key === 'n') { key = 'ArrowDown' }
    if (key === 'p') { key = 'ArrowUp' }
  }

  if (['ArrowDown', 'ArrowUp'].includes(key)) {
    if (key === 'ArrowDown') {
      searchResultSelectedIndex++
    }
    if (key === 'ArrowUp') {
      searchResultSelectedIndex--
    }
    if (searchResultSelectedIndex < 0) {
      searchResultSelectedIndex = 0
    }
    if (searchResultSelectedIndex > size - 1) {
      searchResultSelectedIndex = size - 1
    }

    selectItem(searchResult.getElementsByClassName('search-result-item'), searchResultSelectedIndex)
  }

  if (key === 'Enter' && searchResultArr.length > 0) {
    const item = searchResultArr[searchResultSelectedIndex]
    const nodeId = item.id
    moveInHistory(true, nodeId)
  }


  const num = Number(key)
  if (isCtrlKey && !Number.isNaN(num) && num < 10) {
    searchResultSelectedIndex = Number(key) - 1
    selectItem(searchResult.getElementsByClassName('search-result-item'), searchResultSelectedIndex)
    const item = searchResultArr[searchResultSelectedIndex]
    const nodeId = item.id
    moveInHistory(true, nodeId)
  }
}

const handleTagSearchPopupKeyup = (key:string, e:KeyboardEvent) => {
  const size = tagSearchResultArr.length
  const isCtrlKey = e.ctrlKey
  if (isCtrlKey) {
    if (key === 'n') { key = 'ArrowDown' }
    if (key === 'p') { key = 'ArrowUp' }
  }

  if (['ArrowDown', 'ArrowUp'].includes(key)) {
    if (key === 'ArrowDown') {
      tagSelectedIndex++
    }
    if (key === 'ArrowUp') {
      tagSelectedIndex--
    }
    if (tagSelectedIndex < 0) {
      tagSelectedIndex = 0
    }
    if (tagSelectedIndex > size - 1) {
      tagSelectedIndex = size - 1
    }

    selectItem(tagSearchResult.getElementsByClassName('search-result-item'), tagSelectedIndex)
  }

  if (key === 'Enter' && tagSearchResultArr.length > 0) {
    const item = tagSearchResultArr[tagSelectedIndex]
    const nodeId = item.id
    moveInHistory(true, nodeId)

  }


  const num = Number(key)
  if (isCtrlKey && !Number.isNaN(num) && num < 10) {
    tagSelectedIndex = Number(key) - 1
    selectItem(tagSearchResult.getElementsByClassName('search-result-item'), tagSelectedIndex)
    const item = tagSearchResultArr[tagSelectedIndex]
    const nodeId = item.id
    moveInHistory(true, nodeId)

  }
}

const handleKeyup = (key:string, e:KeyboardEvent) => {
  e.preventDefault()
  //   metaKey: e.metaKey,    // Mac Command 键
  //   ctrlKey: e.ctrlKey,    // Ctrl 键（Mac 和 Windows）
  //   altKey: e.altKey,      // Option/Alt 键
  //   shiftKey: e.shiftKey,  // Shift 键

  //   // 组合键检测
  //   isCmdOrCtrl: e.metaKey || e.ctrlKey,
  //   key: e.key,            // 按下的具体键
  //   code: e.code           // 物理键码
  // });
  // ArrowDown / ArrowUp / ArrowLeft / ArrowRight / Meta / Alt / Control / Backspace
  // Enter

  if (key === 'Escape') {
    popupManager.closePopup()
    return
  }

  const popupId = popupManager.getPopupId()
  // 处理搜索框的按键
  if (popupId === popupIdInfo.search) {
    handleSearchPopupKeyup(key, e)
    return
  }

  if (popupId === popupIdInfo.tagSearch) {
    handleTagSearchPopupKeyup(key, e)
    return
  }

  let curIndex:number = pageNodeArr.findIndex(i => i.containerId === curContainerId)
  let curNode:MyObject = pageNodeArr[curIndex];
  let nextNode:MyObject;
  let prevNode:MyObject;

  const height = window.innerHeight * .8 // 每次滚动距离
  const currentHeight = document.documentElement.scrollTop
  const totalHeight = document.documentElement.scrollHeight
  let h = 0
  switch (key) {
    case '?':
    case '¿':
      popupManager.openPopup(popupIdInfo.help, function(){})
      break;

    case 'B':
      scrollTo(totalHeight)
      break

    case 'b':
      moveInHistory(false)
      break

    case 'f':
      moveInHistory(true)
      break

    case 'i':
      showTableOfContent = !showTableOfContent
      tableOfContent.style.display = showTableOfContent ? 'block' : 'none'
      break;

    case 'l':
      copyTextToClipboard(curNode.id)
      showNotification(curNode.name, curNode.id)
      break

    case 'N':
      if (curIndex >= pageNodeArr.length - 1) { return }
      nextNode = pageNodeArr[curIndex + 1]
      if (curNode.level === nextNode.level) {
        curContainerId = nextNode.containerId
        moveInHistory(true, nextNode.id)

      } else if (curNode.level < nextNode.level) {
        const tempArr = pageNodeArr.filter(i => i.level === curNode.level)
        const index = tempArr.findIndex(i => i.id === curNode.id)
        if (index < tempArr.length - 1) {
          prevNode = tempArr[index + 1]
          curContainerId = prevNode.containerId
          moveInHistory(true, prevNode.id)
        }
      }
      break

    case 'n':
      if (curIndex >= pageNodeArr.length - 1) { return }
      nextNode = pageNodeArr[curIndex + 1]
      curContainerId = nextNode.containerId
      moveInHistory(true, nextNode.id)
      break

    case 'P':
      if (curIndex <= 0) { return }
      prevNode = pageNodeArr[curIndex - 1]
      if (curNode.level === prevNode.level) {
        curContainerId = prevNode.containerId
        moveInHistory(true, prevNode.id)

      } else if (curNode.level < prevNode.level) {
        const tempArr = pageNodeArr.filter(i => i.level === curNode.level)
        const index = tempArr.findIndex(i => i.id === curNode.id)
        if (index > 0) {
          prevNode = tempArr[index - 1]
          curContainerId = prevNode.containerId
          moveInHistory(true, prevNode.id)

        }
      }
      break

    case 'p':
      if (curIndex <= 0) { return }
      prevNode = pageNodeArr[curIndex - 1]
      curContainerId = prevNode.containerId
      moveInHistory(true, prevNode.id)
      break

    case 's':
      popupManager.openPopup(popupIdInfo.search, function () {
        searchResultArr = []
        searchResult.innerHTML = ''
        searchInput.value = ''
        searchInput.focus()
      })
      break;

    case 'T':
      scrollTo(0)
      break

    case 't':
      popupManager.openPopup(popupIdInfo.tagSearch, function () {
        clearSelectedTags()
        selectedTags = []
        tagSearchResult.innerHTML = getMatchedTagItems([], pageNodeArr)
        tagSelectedIndex = 0
        selectItem(tagSearchResult.getElementsByClassName('search-result-item'), tagSelectedIndex)
      })
      break;

    case 'u':
      if (curNode.level === 0) { return }
      const tempIndex = pageNodeArr.findIndex(i => i.id === curNode.id)
      let tempNode
      for (let i = tempIndex - 1; i > -1; i--) {
        tempNode = pageNodeArr[i]
        if (tempNode.level === curNode.level - 1) {
          break
        }
      }
      if (tempNode) {
        curContainerId = tempNode.containerId
        moveInHistory(true, tempNode.id)
      }
      break;

    case 'V':
      h = currentHeight > height ? (currentHeight - height) : 0
      scrollTo(h)
      break;

    case 'v':
      h = Math.min(currentHeight + height, totalHeight) //  (currentHeight + height) > totalHeight ? totalHeight : 0
      scrollTo(h)
      break

  }
}

document.addEventListener('keyup', function(e: KeyboardEvent) {
  e = (e || window.event);
  const key = e.key
  handleKeyup(key, e);
});

document.addEventListener('click', function(e: MouseEvent) {
  const target: HTMLElement | null = e.target as HTMLElement
  if (!target) { return }
  const list = target.classList;

  // 点击tag
  if (list.contains(clickElementClassNames.tag)) {
    const tag = target.dataset.tag;
    if (tag) {
      const index = selectedTags.indexOf(tag)
      if (index === -1) {
        selectedTags.push(tag)
        list.add('selected')
      } else {
        selectedTags.splice(index, 1)
        list.remove('selected')
      }
      selectedTags = [...new Set(selectedTags)]
      const content = getMatchedTagItems(selectedTags, pageNodeArr)
      tagSearchResult.innerHTML = content
    }
  }

  if (list.contains(clickElementClassNames.copy)) {
    const text = target.innerHTML
    copyTextToClipboard(text);
    showMsg('复制成功： ' + text)
  }

  if (list.contains(clickElementClassNames.closeNotification)) {
    closeNotification();
  }


  // 点击搜索结果中的数据
  let parent = target.closest('.search-result-item') as HTMLElement
  if (parent) {
    const nodeId = parent.dataset.nodeid
    if (nodeId) {
      moveInHistory(true, nodeId)

    }
  }
});

document.addEventListener('scroll', function(e) {
  requestAnimationFrame(function () {
    const top = document.documentElement.scrollTop
    for (let i = 0, length = pageNodeArr.length; i < length; i++) {
      let element = pageNodeArr[i]
      if (top < element.top && i > 0) {
        const node = pageNodeArr[i - 1]
        curContainerId = node.containerId
        break
      }
    }
  })
});

const getMatchedTagItems = (tagArr:string[], nodeArr:MyObject[]) => {
  if (tagArr.length === 0) {
    tagSearchResultArr = nodeArr.filter(i => i.tags.length > 0)
  } else {
    let tempArr = nodeArr.filter(i => {
      if (i.tags.length === 0) { return false }
      let matchedTags = i.tags.filter((tag:string) => {
        return tagArr.indexOf(tag) > -1
      })
      return matchedTags.length > 0
    })

    tagSearchResultArr = tempArr
  }
  return generateTagSearchResult(tagArr, tagSearchResultArr)
}

const generateTagSearchResult = (tagArr:string[], resultArr:MyObject[]) => {
  return resultArr.map((item, index) => {
    const tags = item.tags
    const tagElement = tags.map((tag:string) => {
      return `
        <span class="tag-item ${tagArr.indexOf(tag) > -1 ? 'matched' : ''}">${tag}</span>
      `
    }).join('')

    if (index < 9) {
      return `
        <div class="search-result-item" data-nodeid="${item.id}">
          <div class="shortcut-key">Ctrl + ${index + 1}</div>
          <div class="tag-box">${tagElement}</div>
          <div class="search-result-item-content">${item.name}</div>
        </div>
      `
    } else {
      return `
        <div class="search-result-item" data-nodeid="${item.id}">
          <div class="shortcut-key"></div>
          <div class="tag-box">${tagElement}</div>
          <div class="search-result-item-content">${item.name}</div>
        </div>
      `
    }

  }).join('')
}

/**
 * 监听窗口滚动到哪个节点
 */
const createObserver = (nodeArr:MyObject[], nodeInfo:MyObject) => {
  // 设置观察器选项
  const options = {
    root: null, // 相对于视口
    rootMargin: '0px',
    threshold: 0
  };

  const idArr:Array<string> = []       // 记录当前视图内的节点id
  const nameArr:Array<string> = []

  const parentIdArr:Array<string> = [] // 记录有子节点的节点id
  const parentNameArr:Array<string> = []

  // 创建观察器
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id
      const nodeId = id.replace(containerIdPrefix, '')
      const node = nodeInfo[nodeId]
      const nodeName = node.name

      let direction:string = 'pageDown'; // 页面滚动方向
      const boundingRect = entry.boundingClientRect;
      const rootBounds = entry.rootBounds!;

      // 元素顶部在视口上方时，从上进入
      if (boundingRect.top < rootBounds.top) {
        direction = 'pageDown'
      }

      // 元素底部在视口下方时，从下进入
      if (boundingRect.bottom > rootBounds.bottom) {
        direction = 'pageUp'
      }

      if (entry.isIntersecting) {
        if (direction === 'pageUp') {
          idArr.push(id)
          nameArr.push(node.name)
          if (!node.isLeaf) {
            parentIdArr.push(id)
            parentNameArr.push(node.name)
          }
        } else if (direction === 'pageDown') {
          const length = parentIdArr.length
          idArr.splice(length, 0, id)
          nameArr.splice(length, 0, nodeName)
          if (!node.isLeaf) {
            parentIdArr.push(id)
            parentNameArr.push(node.name)
          }
        }
      } else {
        const index = idArr.indexOf(id)
        if (index > -1) {
          if (direction === 'pageUp') {
            idArr.splice(index, 1)
            nameArr.splice(index, 1)
            if (!node.isLeaf) {
              parentIdArr.splice(index, 1)
              parentNameArr.splice(index, 1)
            }
          } else if (direction === 'pageDown') {
            idArr.splice(index, 1)
            nameArr.splice(index, 1)
            if (!node.isLeaf) {
              parentIdArr.splice(index, 1)
              parentNameArr.splice(index, 1)
            }
          }
        }
      }

      const tempIdArr = idArr.filter(id => {
        return !parentIdArr.includes(id)
      })
      const tempNameArr = nameArr.filter(name => {
        return !parentNameArr.includes(name)
      })
      if (tempIdArr.length > 0) {
        // curContainerId = tempIdArr[0]
      }
    });
  }, options);

  nodeArr.map(i => i.container).forEach(element => {
    observer.observe(element);
  })
}

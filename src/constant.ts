/**
 * 弹窗id
 */
export const popupIdInfo = {
  help: 'org-info-help-box',
  search: 'org-info-search-box',
  tagSearch: 'org-info-tag-search-box',
  occur: 'org-info-occur-box',
}

/**
 * 标识可以点击的元素
 */
export const clickElementClassNames = {
  tag: 'click-tag',
  searchItem: 'click-search-item',
  closeNotification: 'click-close-notification',
  copy: 'click-copy',
}

/**
 * id对应的元素的父元素
 */
export const containerIdPrefix = 'outline-container-'

/**
 * 匹配TAG
 */
export const tagRegex = /<[^>]+>/i;

/**
 * 匹配高亮的内容
 */
export const highlight_regex = new RegExp('(<span class="org-info-js_search-highlight">)([^<]*?)(</span>)', "gi")

/**
 * 帮助弹窗的内容
 */
export const helpInfoArr = [
  {
    title: 'help',
    children: [
      {
        key: '?',
        desc: 'show help screen'
      },
      {
        key: 'Esc',
        desc: 'close popup'
      },
      {
        key: 'l',
        desc: 'show current section id and copy to clipboard'
      }
    ]
  },
  {
    title: 'Moving around',
    children: [
      {
        key: 'n / p',
        desc: 'goto next / previous section'
      },
      {
        key: 'N / P',
        desc: 'goto next / previous sibling section'
      },
      {
        key: 'u',
        desc: 'goto parent section'
      },
      {
        key: 'v / V',
        desc: 'scroll down / up half page'
      },
      {
        key: 'T / B',
        desc: 'scroll to top / bottom'
      },
      // {
      //   key: 'f / b',
      //   desc: 'goto next / previous visited section'
      // }
    ]
  },
  {
    title: 'View',
    children: [
      {
        key: 'i',
        desc: 'toggle hide and show of table of content'
      },
      // {
      //   key: 'm',
      //   desc: 'toggle view between plain and info',
      // }
    ]
  },
  {
    title: 'Search',
    children: [
      {
        key: 's',
        desc: 'search title'
      },
      {
        key: 't',
        desc: 'search tags'
      },
      // {
      //   key: 'o',
      //   desc: 'search content'
      // },
      // {
      //   key: 'S / R',
      //   desc: 'search again forward / backward'
      // },
    ]
  },
]
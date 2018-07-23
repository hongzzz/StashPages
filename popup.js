const stashBt = document.querySelector('#stash');
const main = document.querySelector('#main');
const titleInput = document.querySelector('#title-input');


const showItems = async () => {
    let items = await getItems();
    for (let item of items) {
        let li = document.createElement('li');
        li.className = 'stash-item';
        li.innerHTML = `<div class="stash-title">${item.title}</div>
                        <div class="stash-desc">${item.tabs.length} pages -- ${timeago().format(item.time)}</div>`;

        let delButton = document.createElement('div');
        delButton.className = 'del-button';
        delButton.innerHTML = 'DEL';
        delButton.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteItem(item);
        });
        li.appendChild(delButton);
        li.addEventListener('click', function () {
            popItem(item);
        });
        main.appendChild(li);
    }
};

// 获取当前标签页
const getTabs = () => {
    let arr = [];
    return new Promise(resolve => {
        chrome.tabs.query({}, function (tabs) {
            tabs.map((tab, index) => {
                arr.push({ title: tab.title, url: tab.url, id: tab.id });
            });
            resolve(arr);
        });
    });
};

const closeTabs = (arr) => {
    let idArr = [];
    arr.map((t, index) => {
        idArr.push(t.id);
    });
    // 创建新标签页
    chrome.tabs.create({ url: 'chrome://newtab/' }, function () {});
    // 关闭tabs
    chrome.tabs.remove(idArr, function () {
    });
}

// 获取stash
const getItems = async () => {
    let items = [];
    return new Promise(resolve => {
        chrome.storage.sync.get(null, function (result) {
            for (let key in result) {
                if (key.startsWith('item_')) {
                    items.push(result[key]);
                }
            }
            // 按时间倒序排列
            items.sort((a, b) => {
                return b.time - a.time;
            });
            resolve(items);
        });
    });
};

// 设置stash
const setItem = (item) => {
    let itemStr = `item_${item.time}`;
    return new Promise(resolve => {
        chrome.storage.sync.set({ [itemStr]: item }, function () {
            init();
            resolve();
        });
    });
};

// 删除
const deleteItem = (item) => {
    let itemStr = `item_${item.time}`;
    return new Promise(resolve => {
        chrome.storage.sync.remove([itemStr], function () {
            init();
            resolve();
        });
    });
};

const stash = async () => {
    let arr = await getTabs();

    // 标签页不为空才进行stash
    if (arr.length !== 0) {
        // 根据时间戳创建独一对象
        let title = titleInput.value || 'default';
        let item = {
            tabs: arr,
            title: title,
            time: +new Date()
        };
        await setItem(item);
        closeTabs(arr);
    }
};
const popItem = (item) => {
    let itemStr = `item_${item.time}`;
    item.tabs.map((tab, index) => {
        chrome.tabs.create({ url: tab.url }, function () {
        });
    });
    deleteItem(item);
};

const init = async () => {
    main.innerHTML = '';
    await showItems();
    titleInput.focus();
};


// 注册按钮
stashBt.addEventListener('click', stash);
init();
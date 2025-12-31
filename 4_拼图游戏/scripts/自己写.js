let  div = document.getElementById('game')
div.style.width = 800+'px'
div.style.height = 800+'px'
div.style.position = 'relative'
div.style.border = '1px solid'

let cjdx = document.createDocumentFragment()
let blockSize = 800 / 5; // 每个小方块的尺寸
let sum =5
for (var i = 0; i < sum; i++){
    for(var j = 0; j < sum; j++){
        let cjdiv = document.createElement('div')
            cjdiv.style.width = blockSize+'px'
            cjdiv.style.height = blockSize+'px'
            cjdiv.style.border = '1px solid #fff'
            cjdiv.style.boxSizing = 'border-box'; 

            cjdiv.style.position = 'absolute'
            cjdiv.style.left = (j * blockSize) + 'px'; // 列偏移
            cjdiv.style.top = (i * blockSize) + 'px';  // 行偏移

            let bgX = -j * blockSize; // 水平偏移量
            let bgY = -i * blockSize; // 垂直偏移量

            cjdiv.style.background = `url("imgs/QQ图片20251217142130.jpg") no-repeat ${bgX}px ${bgY}px / 800px 800px `
            cjdiv.style.cursor = 'pointer'
            cjdiv.dataset.row = i  //原始行
            cjdiv.dataset.col = j  //原始列
            cjdiv.dataset.currentRow = i;
            cjdiv.dataset.currentCol = j;

            // 将最后一个方块（右下角）设为“空白块”
            if(i == sum-1 && j ==sum-1){
                cjdiv.style.backgroundImage = 'none'
                cjdiv.style.backgroundColor  = '#f0f0f0'
                cjdiv.dataset.isEmpty = 'true';
            }
            

            cjdx.append(cjdiv)
    }
}
div.append(cjdx)


// 1. 获取所有方块，组成 this.blocks 数组
const blocks = Array.from(div.children);
// 2. 实现 this.swap 函数 - 交换两个方块的位置
function swapBlocks(blockA, blockB) {
    // 第一部分：交换的是CSS样式属性（影响视觉显示）
    const tempLeft = blockA.style.left;  // 获取blockA的CSS left值
    const tempTop = blockA.style.top;    // 获取blockA的CSS top值
    
    blockA.style.left = blockB.style.left;  // 将blockA的left设为blockB的值
    blockA.style.top = blockB.style.top;    // 将blockA的top设为blockB的值
    blockB.style.left = tempLeft;           // 将blockB的left设为原来blockA的值
    blockB.style.top = tempTop;             // 将blockB的top设为原来blockA的值
    
    // 第二部分：交换的是自定义数据属性（影响逻辑状态）
    const tempRow = blockA.dataset.currentRow;  // 获取blockA的currentRow
    const tempCol = blockA.dataset.currentCol;  // 获取blockA的currentCol
    
    blockA.dataset.currentRow = blockB.dataset.currentRow;  // 交换currentRow
    blockA.dataset.currentCol = blockB.dataset.currentCol;  // 交换currentCol
    blockB.dataset.currentRow = tempRow;                    // 交换完成
    blockB.dataset.currentCol = tempCol;                    // 交换完成
}


function shuffle() {
    /* 真正的Fisher-Yates洗牌算法
       完全随机打乱所有非空白方块的位置 */
    
    // 1. 找出空白块和非空白块
    const emptyBlock = blocks.find(block => block.dataset.isEmpty === 'true');
    const nonEmptyBlocks = blocks.filter(block => block.dataset.isEmpty !== 'true');
    
    // 2. 保存空白块的原始位置
    const emptyRow = parseInt(emptyBlock.dataset.currentRow);
    const emptyCol = parseInt(emptyBlock.dataset.currentCol);
    const emptyOriginalLeft = emptyBlock.style.left;
    const emptyOriginalTop = emptyBlock.style.top;
    
    // 3. Fisher-Yates洗牌算法打乱非空白方块
    for (let i = nonEmptyBlocks.length - 1; i > 0; i--) {
        // 随机选择一个索引 j (0 ≤ j ≤ i)
        const j = Math.floor(Math.random() * (i + 1));
        
        // 交换方块 i 和方块 j 的位置
        if (i !== j) {
            // 交换视觉位置
            const tempLeft = nonEmptyBlocks[i].style.left;
            const tempTop = nonEmptyBlocks[i].style.top;
            
            nonEmptyBlocks[i].style.left = nonEmptyBlocks[j].style.left;
            nonEmptyBlocks[i].style.top = nonEmptyBlocks[j].style.top;
            nonEmptyBlocks[j].style.left = tempLeft;
            nonEmptyBlocks[j].style.top = tempTop;
            
            // 交换逻辑位置
            const tempRow = nonEmptyBlocks[i].dataset.currentRow;
            const tempCol = nonEmptyBlocks[i].dataset.currentCol;
            
            nonEmptyBlocks[i].dataset.currentRow = nonEmptyBlocks[j].dataset.currentRow;
            nonEmptyBlocks[i].dataset.currentCol = nonEmptyBlocks[j].dataset.currentCol;
            nonEmptyBlocks[j].dataset.currentRow = tempRow;
            nonEmptyBlocks[j].dataset.currentCol = tempCol;
        }
    }
    
    // 4. 确保拼图有解（重要！）
    // 对于3x3拼图，需要检查逆序数的奇偶性
    if (!isSolvable()) {
        // 如果无解，交换任意两个相邻的非空白块
        fixSolvability();
    }
    
    /* // 5. 空白块保持在原位（右下角）
    emptyBlock.style.left = emptyOriginalLeft;
    emptyBlock.style.top = emptyOriginalTop;
    emptyBlock.dataset.currentRow = emptyRow.toString();
    emptyBlock.dataset.currentCol = emptyCol.toString(); */
}

function isSolvable() {
    /* 检查拼图是否有解
       原理：计算逆序数（不包括空白块） */
    
    // 1. 将非空白方块按行主序展开为一维数组
    const tiles = [];
    for (let r = 0; r < sum; r++) {
        for (let c = 0; c < sum; c++) {
            const block = blocks.find(b => 
                parseInt(b.dataset.currentRow) === r && 
                parseInt(b.dataset.currentCol) === c &&
                b.dataset.isEmpty !== 'true'
            );
            if (block) {
                // 计算每个方块的"编号"：row*3 + col
                const originalRow = parseInt(block.dataset.row);
                const originalCol = parseInt(block.dataset.col);
                tiles.push(originalRow * sum + originalCol);
            }
        }
    }
    
    // 2. 计算逆序数
    let inversions = 0;
    for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            if (tiles[i] > tiles[j]) {
                inversions++;
            }
        }
    }
    
    // 3. 对于3x3拼图：逆序数为偶数则有解
    return inversions % 2 === 0;
}

function fixSolvability() {
    /* 如果拼图无解，修复它
       交换任意两个相邻的非空白块即可改变逆序数奇偶性 */
    
    // 找到两个相邻的非空白块
    const block1 = blocks.find(b => 
        b.dataset.isEmpty !== 'true' && 
        parseInt(b.dataset.currentRow) === 0 && 
        parseInt(b.dataset.currentCol) === 0
    );
    
    const block2 = blocks.find(b => 
        b.dataset.isEmpty !== 'true' && 
        parseInt(b.dataset.currentRow) === 0 && 
        parseInt(b.dataset.currentCol) === 1
    );
    
    if (block1 && block2) {
        swapBlocks(block1, block2);
    }
}

// 4. 添加点击交互功能
//.addEventListener()：为元素添加事件监听的方法,'click'：监听的事件类型，这里是鼠标点击事件
//function(event) { ... }：事件发生时要执行的回调函数
div.addEventListener('click', function(event) {
    const clickedBlock = event.target; //指向实际被点击的元素
    
    // 排除容器本身和空白块
    if (clickedBlock === div || clickedBlock.dataset.isEmpty === 'true') {
        return;
    }
    
    // 找到空白块
    const emptyBlock = blocks.find(block => block.dataset.isEmpty === 'true');
    
    // 获取位置
    const clickedRow = parseInt(clickedBlock.dataset.currentRow);
    const clickedCol = parseInt(clickedBlock.dataset.currentCol);
    const emptyRow = parseInt(emptyBlock.dataset.currentRow);
    const emptyCol = parseInt(emptyBlock.dataset.currentCol);
    
    // 检查是否相邻：同一行且列差1，或同一列且行差1
    const isAdjacent = 
        (clickedRow === emptyRow && Math.abs(clickedCol - emptyCol) === 1) ||
        (clickedCol === emptyCol && Math.abs(clickedRow - emptyRow) === 1);
    
    if (isAdjacent) {
        // 交换位置
        swapBlocks(clickedBlock, emptyBlock);
        
        // 检查是否胜利
        if (checkWin()) {
            setTimeout(() => { //延迟执行胜利提示,第一个参数要执行的函数（箭头函数），第二个参数：延迟时间，100毫秒
                alert('🎉 恭喜！拼图完成！');
            }, 100);
        }
    } else {
        // 无效点击的反馈
        clickedBlock.style.transform = 'scale(0.95)'; //缩小到原来的95%
        setTimeout(() => {
            //将transform属性设为空字符串，清除scale(0.95)效果
            clickedBlock.style.transform = '';
        }, 200);
    }
});

// 5. 胜利判断函数
function checkWin() {
    for (const block of blocks) {
        // 跳过空白块
        if (block.dataset.isEmpty === 'true') continue;
        
        // 比较当前位置和原始位置
        const currentRow = parseInt(block.dataset.currentRow);
        const currentCol = parseInt(block.dataset.currentCol);
        const originalRow = parseInt(block.dataset.row);
        const originalCol = parseInt(block.dataset.col);
        
        if (currentRow !== originalRow || currentCol !== originalCol) {
            return false; // 有方块不在正确位置
        }
    }
    return true; // 所有方块都在正确位置
}

// 6. 页面加载时自动打乱
//为window对象添加一个事件监听器，事件类型：'DOMContentLoaded' - DOM内容加载完成事件
//仅等待HTML结构加载完成，不等待图片、样式表等
window.addEventListener('DOMContentLoaded', function() {
    // 添加一点延迟，让用户先看到完整图片
    setTimeout(() => {
        shuffle();
    }, 500);
});

function Block(game,r,c) {
    //当前位置
    this.left = c * game.blockWidth
    this.top = r * game.blockHeight
    //目标位置
    this.targetLeft = this.left
    this.targetTop = this.top

    this.dom = document.createElement('div')
    this.dom.style.width = game.blockWidth + 'px'
    this.dom.style.height = game.blockHeight + 'px'
    this.dom.style.border = '1px solid #fff'
    this.dom.style.background = `url(${game.inmgUrl}) no-repeat -${this.targetLeft}px -${this.targetTop}px / ${game.width}px ${game.height}px`
    this.dom.style.position = 'absolute'
    this.dom.style.boxSizing = 'border-box'
    this.dom.style.transition   = '0.3s'
    this.dom.style.cursor = 'pointer'

    //更新位置
    this.updatePosition = function () {
        this.dom.style.left = this.left +'px'
        this.dom.style.top = this.top + 'px'
    }
    this.updatePosition()


    //给方块注册点击事件
    this.dom.onclick = function () {
        if (game.isDver){
            return
        }

        //1.交换位置
        if (this.top === game.hideBlock.top && parseInt(Math.abs(this.left - game.hideBlock.left)) === parseInt(game.blockWidth)
            ||
            this.left === game.hideBlock.left && parseInt(Math.abs(this.top - game.hideBlock.top)) === parseInt(game.blockHeight)
        ){
                game.swap(this,game.hideBlock)
        }
    
        //2.游戏结束判定
        game.checkIsOver()
    }.bind(this)

    game.dom.append(this.dom)
}
function Game(config) {
    this.width = config.width
    this.height = config.height
    this.rows = config.rows
    this.cols = config.cols
    this.inmgUrl = config.inmgUrl
    this.dom = config.dom

    /**
     * 判断逆序数是否为奇数
     * @returns 
     */
    this.isDddInversions = function () {
         var inversionCount = 0;
         for (var i = 0; i < this.blockCount - 2; i++){
            for (var j = i +1; j < this.blockCount - 1; j++){
                if(this.blocks[i].top > this.blocks[j].top
                    ||  (this.blocks[i].top === this.blocks[j].top
                    && this.blocks[i].left > this.blocks[j].left)
                ){
                    inversionCount++
                }
            }
         }
         console.log(inversionCount);
         return inversionCount % 2 !== 0
    }

    /**
     * 游戏结束做的事情
     */
    this.over = function () {
        this.hideBlock.dom.style.display = 'block'
        this.blocks.forEach(function (block) {
            block.dom.style.border = 'none'
        })
    }

    /**
     * 游戏结束判定
     */
    this.checkIsOver = function () {
        var tolerance = 1; //容差
        this.isDver =  this.blocks.every(function (block) {
            return Math.abs(block.left- block.targetLeft) < tolerance 
            && Math.abs(block.top  - block.targetTop) < tolerance
        })
        if (this.isDver)
            this.over()
    }

    /**
     * 交换位置
     * @param {block} b1 
     * @param {block} b2 
     */
    this.swap = function(b1,b2){
            var temp = b1.left
            b1.left = b2.left
            b2.left = temp

            temp = b1.top
            b1.top = b2.top
            b2.top = temp

            b1.updatePosition()
            b2.updatePosition()
    }

    /**
     * 洗牌
     */
    this.shuffle = function () {
        /*1. Fisher-Yates洗牌算法 */
        this.blocks.forEach(function (block,i) {
            var index = Math.floor(Math.random() * (this.blocks.length -1 -i) + i)
            
            //2.交换位置
           this.swap(block,this.blocks[index])
        }.bind(this))

        //判断逆序数奇偶
        if (this.isDddInversions()){
            this.swap(this.blocks[this.blockCount - 3],this.blocks[this.blockCount-2])
        }
    }

    /**
     * 初始化计算属性
     */
    this.initCompute = function () {
        this.blockWidth =  this.width / this.cols
        this.blockHeight = this.height / this.rows
        this.blockCount = this.rows * this.cols
    }
    /**
     * 初始化game容器
     */
    this.initGameDom = function(){
        this.dom.innerHTML = ''
        this.dom.style.width = this.width + 'px'
        this.dom.style.height = this.height + 'px'
        this.dom.style.position = 'relative'
        this.dom.style.border = '1px solid'
    }
    //3.初始化block
    this.initBlocks = function () {
        this.blocks = []
        for (var r = 0; r < this.rows; r++){
            for (var c = 0; c < this.cols; c++){
                var block = new Block(this,r,c)
                this.blocks.push(block)
            }
        }
        block.dom.style.display = 'none'
        this.hideBlock = block
        console.log(this.blocks);
        
        //打乱游戏
        this.shuffle()
    }


    this.init = function () {
        //1.初始化计算属性
        this.initCompute();

        //2.初始化game容器
        this.initGameDom();

        //3.初始化block
        this.initBlocks();
    }
    this.init()
}

var hangInput = document.getElementById('hang');
var lieInput = document.getElementById('lie');
var startBtn = document.getElementById('startBtn');
var gameDom = document.getElementById('game');
var fileInput = document.getElementById('tupian');
var defaultImg = 'imgs/QQ图片20251217142130.jpg';  
var customImageUrl = null;  // 存储用户上传的图片 Data URL

// 监听文件选择，读取图片
fileInput.addEventListener('change', function () {
    // 获取用户选中的文件对象（只取第一个）
    // fileInput.files 是一个 FileList 对象（类数组），
    // 即使用户只选了一个文件，也必须通过索引 [0] 来获取该文件对象
    var file = fileInput.files[0];

    // 如果用户点击了“取消”或清除了选择，
    // file 会是 undefined，此时将自定义图片地址重置为 null，
    // 并通过 return 终止后续读取操作，避免报错
    if (!file) {
        customImageUrl = null;
        return;
    }

    // 创建 FileReader 实例，这是一个专门用来读取文件内容的对象
    // 它提供了多种读取方式（文本、二进制、DataURL等）
    var reader = new FileReader();

    // 为 reader 绑定 onload 事件处理函数
    // 注意：文件读取是一个异步操作，
    // 调用 readAsDataURL 后不会立即得到结果，
    // 而是在读取完成后自动触发 onload 回调
    reader.onload = function (e) {
        // e.target 就是当前的 reader 对象
        // e.target.result 属性保存了读取完成后的结果数据
        // 由于下面调用了 readAsDataURL，所以 result 是一个 Data URL 字符串
        // 格式类似：data:image/jpeg;base64,/9j/4AAQSkZJRg...
        // 这种格式已经包含了图片的完整像素信息，可以直接作为 img 的 src
        customImageUrl = e.target.result;

        // 同步更新页面右侧的参考图片预览
        // 通过 CSS 选择器找到 .reference 容器内的 img 元素并替换其 src
        document.querySelector('.reference img').src = customImageUrl;
    };

    // 调用 readAsDataURL 方法开始读取文件内容
    // 参数 file 是上面获取到的文件对象
    // 这个方法会将图片的二进制数据编码成 base64 字符串，
    // 并以 data:image/... 的 Data URL 格式返回
    // 读取过程是异步的，完成后会自动触发上面绑定的 onload 回调
    reader.readAsDataURL(file);
});

// 开始游戏（支持自定义图片）
function startNewGame() {
    var hang = parseInt(hangInput.value) || 3;
    var lie = parseInt(lieInput.value) || 3;

    // 使用用户上传的图片，如果没有则用默认图
    var imgUrl = customImageUrl || defaultImg;

    // 清空游戏容器
    gameDom.innerHTML = '';

    // 更新参考图（如果还没更新，这里确保它和游戏一致）
    var refImg = document.querySelector('.reference img');
    if (refImg) {
        refImg.src = imgUrl;
    }

    // 创建新游戏
    new Game({
        width: 800,
        height: 800,
        rows: hang,
        cols: lie,
        inmgUrl: imgUrl,
        dom: gameDom
    });
}

// 页面加载时生成默认拼图
startNewGame();

// 点击按钮重新开始
startBtn.addEventListener('click', startNewGame);


// let game = new Game({
//     width:800,
//     height:800,
//     rows:hang,
//     cols:lie,
//     inmgUrl: 'imgs/QQ图片20251217142130.jpg',
//     dom:document.getElementById('game')
// })


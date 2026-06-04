let game = new Game({
    width:800,
    height:800,
    rows:3,
    cols:3,
    inmgUrl:'imgs/QQ图片20251217142130.jpg', //这个路径相对的是页面文件也就是html文件而不是js文件，js最终都要作为脚本
    //本被导入导入到页面上，游览器运行的也是html文件
    dom:document.getElementById('game')
});

function Block(game,r,c){
//     //当前位置
    this.left = c *game.blockWidth,
    this.top  = r * game.blockHeight
    //目标位置
    this.targetLeft = this.left;
    this.targetTop = this.top;

    this.dom = document.createElement('div');
    this.dom.style.width = game.blockWidth+'px';
    this.dom.style.height = game.blockHeight+'px';
    this.dom.style.position = 'absolute';
    this.dom.style.background = `url("${game.inmgUrl}") no-repeat -${this.targetLeft}px -${this.targetTop}px / ${game.width}px ${game.height}px `;
    this.dom.style.border = '1px solid #fff'
    this.dom.style.boxSizing = 'border-box'
    this.dom.style.cursor = 'pointer'
    this.dom.style.transition = '0.5s'

//     //更新位置
    this.updatePosition = function(){
        this.dom.style.left = this.left+'px';
        this.dom.style.top = this.top+'px'
    }
    this.updatePosition();

//     /* 点击事件 */
    this.dom.onclick = function () {
        if (game.isDver){
            return;
        }
        //判断相邻
        if (this.top === game.hideBlock.top && parseInt(Math.abs(this.left - game.hideBlock.left)) === parseInt(game.blockWidth) 
        || this.left === game.hideBlock.left && parseInt(Math.abs(this.top - game.hideBlock.top)) === parseInt(game.blockHeight)) {
        //"当我点击盒子的时候，这个this会去找block对象看是那个元素，然后比较的也是那个元素的位置，然后把那个元素传进去交换位置"
            game.swap(this,game.hideBlock);
        }
        //游戏结束
        game.checkIsOver();
    }.bind(this);

    game.dom.append(this.dom);
}

function Game(config){
    //// 这里的 this 指向新创建的 Game 实例对象
    this.width = config.width;
    this.height = config.height;
    this.rows = config.rows;
    this.cols = config.cols;
    this.inmgUrl = config.inmgUrl;
    this.dom = config.dom;

//     /* 游戏结束做的事情 */
    this.over = function(){
        this.hideBlock.dom.style.display = 'block'
        this.blocks.forEach(function(block){
            block.dom.style.border = 'none';
        }).bind(this)
    }

//     //游戏结束判定
    this.checkIsOver = function(){
        this.isDver = this.blocks.every(function(block){
            return block.left === block.targetLeft && block.top === block.targetTop;
        })
        if (this.isDver){
            this.over();
        }
    }

//     //交换位置
    this.swap = function(b1,b2){
        var temp = b1.left;
            b1.left = b2.left;
            b2.left = temp;

            temp = b1.top;
            b1.top = b2.top;
            b2.top = temp;

            b1.updatePosition();
            b2.updatePosition()
    }

//     //判断逆序数是不是奇数
    this.isDddInversions = function (){
          var inversionCount = 0;
          for (var i=0; i<this.blockCount-2;i++){
            for(var j=i+1; j<this.blockCount-1;j++){
                if (this.blocks[i].top > this.blocks[j].top ||
                    this.blocks[i].top === this.blocks[j].top && this.blocks[i].left > this.blocks[j].left
                ){
                    inversionCount++;
                }
            }
          }
          return inversionCount % 2 !==0;
    }

//     /* 洗牌 */
    this.shuffle = function(){
        /* Fisher-Yates洗牌算法 */
        this.blocks.forEach(function(block,i){ 
            var index = Math.floor(Math.random() * (this.blocks.length-1 -i)) + i;
            //交换位置
            this.swap(block,this.blocks[index]);

        }.bind(this))

    //     //判断逆序数奇偶
        if (this.isDddInversions()){
            this.swap(this.blocks[this.blockCount-3],this.blocks[this.blockCount-2]);
        }
    }


//     /* 
//     1.初始化计算属性 
//     */
    this.initCompute  = function(){
        this.blockWidth =this.width / this.cols;
        this.blockHeight = this.height / this.rows;
        this.blockCount = this.rows * this.cols;
    }

//     /* 
//     初始化game容器 
//     */
    this.initGameDom = function(){
        this.dom.innerHTML =  '';
        this.dom.style.width = this.width+'px';
        this.dom.style.height = this.height+'px';
        this.dom.style.border = '1px solid ';
        this.dom.style.position = 'relative';
    }

//     /* 初始化block */
    this.initBlocks = function(){
       this.blocks = [];
       for (var r=0; r<this.rows; r++){
        for (var c=0; c<this.cols; c++){
            var block = new Block(this,r,c);
            this.blocks.push(block);
        }
       }
       block.dom.style.display = 'none';
       this.hideBlock = block;

//        //打乱顺序
       this.shuffle();
    }


//     /* 
//     *游戏初始化
//     */
    this.init = function(){
        //1.初始化计算属性
        this.initCompute();

        //2.初始化game容器
        this.initGameDom();

        //3.初始化block
        this.initBlocks();
    }
    this.init()

}

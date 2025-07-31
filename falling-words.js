// p5.js 诗歌分词落下效果
class FallingWord {
    constructor(word, x, y) {
        this.word = word;
        this.x = x;
        this.y = y;
        this.targetY = y; // 目标位置
        this.speed = random(0.5, 1);
        this.isFixed = false;
        this.opacity = 255;
        this.fontSize = random(12, 16); // 更小的字体
        this.color = color(255, 255, 255, this.opacity);
        this.glowIntensity = random(0.5, 1.0); // 发光强度
        this.glowPhase = random(0, TWO_PI); // 发光相位
    }

    update() {
        if (!this.isFixed) {
            this.y += this.speed;
            // 如果超出屏幕底部，重置到顶部（只有在活动状态下）
            if (this.y > height + 50 && isActive) {
                this.y = -50;
                this.x = random(50, width - 50);
            }
        }
        
        // 更新发光效果
        this.glowPhase += 0.1;
        this.glowIntensity = 0.5 + 0.5 * sin(this.glowPhase);
    }

    display() {
        push();
        textAlign(CENTER, CENTER);
        textSize(this.fontSize);
        
        // 动态发光效果
        let glowBlur = 10 + 10 * this.glowIntensity;
        let glowAlpha = 0.6 + 0.4 * this.glowIntensity;
        
        // 主要发光效果
        drawingContext.shadowBlur = glowBlur;
        drawingContext.shadowColor = `rgba(255, 255, 255, ${glowAlpha})`;
        
        // 绘制发光文字
        fill(this.color);
        noStroke();
        text(this.word, this.x, this.y);
        
        // 蓝色光晕效果
        drawingContext.shadowBlur = glowBlur * 0.6;
        drawingContext.shadowColor = `rgba(100, 150, 255, ${glowAlpha * 0.7})`;
        text(this.word, this.x, this.y);
        
        // 中心高光
        drawingContext.shadowBlur = 0;
        fill(255, 255, 255, this.opacity * 0.4 * this.glowIntensity);
        text(this.word, this.x - 1, this.y - 1);
        
        // 添加闪烁的星星效果
        if (this.glowIntensity > 0.8) {
            fill(255, 255, 255, 0.8);
            noStroke();
            ellipse(this.x - this.fontSize * 0.8, this.y - this.fontSize * 0.3, 2, 2);
            ellipse(this.x + this.fontSize * 0.8, this.y + this.fontSize * 0.3, 1.5, 1.5);
        }
        
        pop();
    }

    checkClick(mouseX, mouseY) {
        if (this.isFixed) return false;
        
        let d = dist(mouseX, mouseY, this.x, this.y);
        if (d < this.fontSize * 2) {
            this.isFixed = true;
            this.targetY = this.y;
            return true;
        }
        return false;
    }

    setFixed() {
        this.isFixed = true;
        this.targetY = this.y;
        this.opacity = 200;
        this.color = color(255, 255, 255, this.opacity);
    }
}

// 全局变量
let fallingWords = [];
let isActive = false;
let canvas;

function setup() {
    // 创建canvas并添加到overlap容器中
    let container = document.querySelector('.overlap');
    canvas = createCanvas(375, 812);
    canvas.parent(container);
    canvas.style('position', 'absolute');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '6'); // 在生成的图片之上，但在UI之下
    canvas.style('pointer-events', 'none'); // 不影响UI交互
    canvas.style('background', 'transparent'); // 透明背景
    
    // 设置字体为细体
    textFont('PingFang SC-Light');
    
    // 添加全局点击事件监听
    document.addEventListener('click', handleGlobalClick);
}

function draw() {
    // 完全透明背景，让所有内容可见
    clear();
    
    // 更新和显示所有单词（包括已固定的）
    for (let word of fallingWords) {
        word.update();
        word.display();
    }
}

// 全局点击处理
function handleGlobalClick(event) {
    if (!isActive) return;
    
    // 获取点击位置相对于canvas的坐标
    const rect = canvas.elt.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // 检查点击
    for (let word of fallingWords) {
        if (word.checkClick(mouseX, mouseY)) {
            console.log('点击了:', word.word);
            break;
        }
    }
}

// 开始诗歌落下效果
function startFallingWords(poetry) {
    // 清空现有单词
    fallingWords = [];
    
    // 分词处理
    let words = splitPoetry(poetry);
    
    // 创建落下的单词
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        if (word.trim().length > 0) {
            let x = random(50, width - 50);
            let y = random(-200, -50);
            fallingWords.push(new FallingWord(word, x, y));
        }
    }
    
    isActive = true;
    console.log('开始诗歌落下效果，共', fallingWords.length, '个单词');
}

// 停止效果
function stopFallingWords() {
    // 停止下新词，但保留已固定的词
    isActive = false;
    
    // 移除事件监听器
    document.removeEventListener('click', handleGlobalClick);
    
    console.log('停止下新词，保留已固定的词');
}

// 完全停止效果（移除所有词）
function stopFallingWordsCompletely() {
    isActive = false;
    fallingWords = [];
    
    // 移除事件监听器
    document.removeEventListener('click', handleGlobalClick);
    
    if (canvas) {
        canvas.remove(); // 移除canvas元素
    }
}

// 诗歌分词函数
function splitPoetry(poetry) {
    // 移除HTML标签
    poetry = poetry.replace(/<[^>]*>/g, '');
    
    // 按标点符号和换行符分割
    let words = poetry.split(/[，。！？；：、\n\r\s]+/);
    
    // 过滤空字符串和太短的词
    words = words.filter(word => word.trim().length > 0);
    
    // 进一步分割长句子
    let result = [];
    for (let word of words) {
        if (word.length > 8) {
            // 长句子按字符分割
            for (let i = 0; i < word.length; i += 4) {
                result.push(word.substring(i, i + 4));
            }
        } else {
            result.push(word);
        }
    }
    
    return result;
}

// 导出函数供外部调用
window.startFallingWords = startFallingWords;
window.stopFallingWords = stopFallingWords;
window.stopFallingWordsCompletely = stopFallingWordsCompletely; 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function PoetryGame({ poetry, onComplete }) {
  const [words, setWords] = useState([]);
  const [fixedWords, setFixedWords] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);

  // 模拟诗歌数据
  useEffect(() => {
    if (poetry) {
      // 这里应该用jieba分词
      const mockWords = poetry.split(' ').filter(word => word.length > 0);
      setWords(mockWords);
    } else {
      // 测试数据
      const testWords = ['今天', '心情', '很好', '想', '分享', '给', '朋友'];
      setWords(testWords);
    }
  }, [poetry]);

  const handleWordClick = (word, index) => {
    setFixedWords(prev => [...prev, { word, id: Date.now() + index }]);
    
    // 检查游戏是否完成
    if (fixedWords.length + 1 >= words.length) {
      setTimeout(() => {
        setGameComplete(true);
        onComplete();
      }, 1000);
    }
  };

  const renderFallingWord = (word, index) => {
    const animatedValue = new Animated.Value(-50);
    
    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: height + 50,
        duration: 3000 + Math.random() * 2000,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        key={index}
        style={[
          styles.fallingWord,
          {
            transform: [{ translateY: animatedValue }],
            left: Math.random() * (width - 100),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.wordButton}
          onPress={() => handleWordClick(word, index)}
        >
          <Text style={styles.wordText}>{word}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFixedWord = (item) => (
    <View key={item.id} style={styles.fixedWord}>
      <Text style={styles.fixedWordText}>{item.word}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>点击词语，创作你的诗</Text>
      
      {/* 掉落的词语 */}
      <View style={styles.fallingContainer}>
        {words.map((word, index) => renderFallingWord(word, index))}
      </View>
      
      {/* 固定的诗句 */}
      <View style={styles.fixedContainer}>
        {fixedWords.map(renderFixedWord)}
      </View>
      
      {/* 游戏完成提示 */}
      {gameComplete && (
        <View style={styles.completeOverlay}>
          <Text style={styles.completeText}>诗歌创作完成！</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  fallingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fallingWord: {
    position: 'absolute',
  },
  wordButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  wordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fixedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fixedWord: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  fixedWordText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 
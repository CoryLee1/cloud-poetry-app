import React, { useState } from 'react';
import { StyleSheet, View, Text, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// 导入组件
import CloudScene from './src/components/CloudScene/CloudScene';
import ChatInterface from './src/components/ChatInterface/ChatInterface';
import PoetryGame from './src/components/PoetryGame/PoetryGame';
import ShareComponent from './src/components/ShareComponent/ShareComponent';

export default function App() {
  const [currentView, setCurrentView] = useState('chat'); // chat, game, share
  const [userMood, setUserMood] = useState('');
  const [generatedPoetry, setGeneratedPoetry] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleMoodSubmit = async (mood) => {
    setUserMood(mood);
    setCurrentView('game');
    // TODO: 调用API生成诗歌和图片
  };

  const handleGameComplete = () => {
    setCurrentView('share');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* 背景渐变 */}
        <View style={styles.backgroundGradient} />
        
        {/* 云朵渲染区域 */}
        <View style={styles.cloudContainer}>
          <CloudScene />
        </View>

        {/* 主要内容区域 */}
        <View style={styles.contentContainer}>
          {currentView === 'chat' && (
            <ChatInterface onMoodSubmit={handleMoodSubmit} />
          )}
          
          {currentView === 'game' && (
            <PoetryGame 
              poetry={generatedPoetry}
              onComplete={handleGameComplete}
            />
          )}
          
          {currentView === 'share' && (
            <ShareComponent 
              poetry={generatedPoetry}
              image={generatedImage}
            />
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(196, 226, 255, 0.8)',
  },
  cloudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
}); 
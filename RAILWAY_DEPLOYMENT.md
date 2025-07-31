# Railway 部署指南

## 🚀 部署步骤

### 1. 环境变量配置

在Railway控制台中设置以下环境变量：

```
OPENAI_API_KEY=sk-your-actual-openai-api-key
PORT=8080
NODE_ENV=production
```

**注意：**
- Railway默认使用8080端口，无需强制改为3001
- API Key必须不包含特殊字符或空格

### 2. API Key 要求

- **格式**: 必须以 `sk-` 开头
- **长度**: 至少20个字符
- **字符**: 只能包含字母、数字、连字符和下划线
- **来源**: 从 [OpenAI Platform](https://platform.openai.com/api-keys) 获取

### 3. 常见问题解决

#### 问题1: `Bearer sk-proj-... is not a legal HTTP header value`
**原因**: API Key包含特殊字符或格式不正确
**解决**: 
- 检查API Key是否以 `sk-` 开头
- 确保没有多余的空格或换行符
- 重新生成API Key
- 确保API Key只包含合法字符：`a-z`, `A-Z`, `0-9`, `-`, `_`

#### 问题2: `APIConnectionError: Connection error`
**原因**: 网络连接问题或API Key无效
**解决**:
- 检查网络连接
- 验证API Key是否正确
- 确认OpenAI服务状态

#### 问题3: `APIAuthenticationError`
**原因**: API Key无效或已过期
**解决**:
- 重新生成API Key
- 检查API Key权限设置
- 确认账户余额

### 4. 验证部署

部署成功后，访问你的Railway URL，应该能看到：
- 服务器启动信息
- API文档显示
- 环境变量正确加载

### 5. 调试技巧

1. **查看日志**: 在Railway控制台查看实时日志
2. **测试API**: 使用Postman或curl测试API端点
3. **检查环境变量**: 确保所有环境变量都正确设置

## 🔧 故障排除

如果遇到问题，请检查：
1. 环境变量是否正确设置
2. API Key是否有效且格式正确
3. 网络连接是否正常
4. 账户余额是否充足

## 📝 重要提示

- **端口**: Railway默认使用8080端口，这是正常的
- **API Key**: 确保没有空格、换行符或特殊字符
- **环境变量**: 在Railway控制台中正确设置所有环境变量 
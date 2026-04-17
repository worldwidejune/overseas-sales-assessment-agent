const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 员工数据库（实际使用时应该从数据库或文件读取）
const employeeDatabase = {
    '张三': { region: 'na', role: 'direct', name: '张三', wecomId: 'zhangsan' },
    '李四': { region: 'na', role: 'channel', name: '李四', wecomId: 'lisi' },
    '王五': { region: 'non_na', role: 'direct', name: '王五', wecomId: 'wangwu' },
    '赵六': { region: 'non_na', role: 'channel', name: '赵六', wecomId: 'zhaoliu' },
    '孙七': { region: 'na', role: 'leader', name: '孙七', wecomId: 'sunqi' },
    '周八': { region: 'non_na', role: 'leader', name: '周八', wecomId: 'zhouba' },
    'changwu': { region: 'na', role: 'direct', name: 'changwu', wecomId: 'changwu' }
};

// 缓存 access_token
let accessTokenCache = {
    token: '',
    expireTime: 0
};

// 获取企业微信 access_token
async function getAccessToken() {
    const now = Date.now();

    // 检查缓存是否有效（有效期 7200 秒，提前 300 秒刷新）
    if (accessTokenCache.token && accessTokenCache.expireTime > now) {
        return accessTokenCache.token;
    }

    try {
        const response = await axios.get(
            `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${process.env.WEWORK_CORP_ID}&corpsecret=${process.env.WEWORK_SECRET}`
        );

        if (response.data.errcode === 0) {
            accessTokenCache = {
                token: response.data.access_token,
                expireTime: now + (response.data.expires_in - 300) * 1000
            };
            console.log('Access token 获取成功');
            return accessTokenCache.token;
        } else {
            throw new Error(`获取 access_token 失败: ${response.data.errmsg}`);
        }
    } catch (error) {
        console.error('获取 access_token 错误:', error.message);
        throw error;
    }
}

// 通过 code 获取用户信息
async function getUserInfo(code) {
    try {
        const accessToken = await getAccessToken();
        const response = await axios.get(
            `https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo?access_token=${accessToken}&code=${code}`
        );

        if (response.data.errcode === 0) {
            return {
                wecomId: response.data.UserId,
                deviceId: response.data.DeviceId
            };
        } else {
            throw new Error(`获取用户信息失败: ${response.data.errmsg}`);
        }
    } catch (error) {
        console.error('获取用户信息错误:', error.message);
        throw error;
    }
}

// 获取用户详细信息（可选，用于获取部门、姓名等）
async function getUserDetail(wecomId) {
    try {
        const accessToken = await getAccessToken();
        const response = await axios.get(
            `https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=${accessToken}&userid=${wecomId}`
        );

        if (response.data.errcode === 0) {
            return {
                name: response.data.name,
                mobile: response.data.mobile,
                email: response.data.email,
                department: response.data.department,
                position: response.data.position
            };
        } else {
            throw new Error(`获取用户详情失败: ${response.data.errmsg}`);
        }
    } catch (error) {
        console.error('获取用户详情错误:', error.message);
        throw error;
    }
}

// 生成认证 token（用于前端后续请求）
function generateAuthToken(wecomId, region, role) {
    // 简单实现：Base64 编码（生产环境应该使用 JWT）
    const payload = JSON.stringify({ wecomId, region, role, timestamp: Date.now() });
    return Buffer.from(payload).toString('base64');
}

// 验证认证 token
function verifyAuthToken(token) {
    try {
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());
        // 检查 token 是否过期（24 小时）
        if (Date.now() - payload.timestamp > 24 * 60 * 60 * 1000) {
            return null;
        }
        return payload;
    } catch (error) {
        return null;
    }
}

// 接口 1: 跳转到企微授权页面
app.get('/auth/wework', (req, res) => {
    const redirectUri = `${process.env.BACKEND_URL}/auth/callback`;
    const state = 'STATE'; // 可以使用随机字符串防止 CSRF
    const scope = 'snsapi_base'; // 静默授权，不弹窗

    const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${process.env.WEWORK_AGENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

    console.log('跳转到企微授权:', authUrl);
    res.redirect(authUrl);
});

// 接口 2: 企微授权回调
app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: '缺少授权 code' });
    }

    try {
        console.log('收到企微回调, code:', code);

        // 获取用户企微 ID
        const userInfo = await getUserInfo(code);
        console.log('用户企微 ID:', userInfo.wecomId);

        // 查询员工数据库
        const employee = Object.values(employeeDatabase).find(emp => emp.wecomId === userInfo.wecomId);

        if (!employee) {
            // 用户不在员工数据库中，重定向到错误页面
            const errorUrl = `${process.env.FRONTEND_URL}?error=not_found`;
            console.log('用户不在员工数据库中');
            return res.redirect(errorUrl);
        }

        // 生成认证 token
        const authToken = generateAuthToken(userInfo.wecomId, employee.region, employee.role);

        // 重定向到前端，携带认证信息
        const redirectUrl = `${process.env.FRONTEND_URL}?token=${encodeURIComponent(authToken)}`;
        console.log('认证成功，重定向到前端');
        res.redirect(redirectUrl);

    } catch (error) {
        console.error('认证回调错误:', error);
        const errorUrl = `${process.env.FRONTEND_URL}?error=auth_failed`;
        res.redirect(errorUrl);
    }
});

// 接口 3: 获取员工信息（前端通过 token 调用）
app.get('/api/employee', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(401).json({ error: '缺少认证 token' });
    }

    // 验证 token
    const authData = verifyAuthToken(token);

    if (!authData) {
        return res.status(401).json({ error: 'token 无效或已过期' });
    }

    // 查询员工信息
    const employee = Object.values(employeeDatabase).find(emp => emp.wecomId === authData.wecomId);

    if (!employee) {
        return res.status(404).json({ error: '员工不存在' });
    }

    // 返回员工信息（不包含敏感数据）
    res.json({
        name: employee.name,
        region: employee.region,
        role: employee.role
    });
});

// 接口 4: 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('企微 Corp ID:', process.env.WEWORK_CORP_ID);
    console.log('前端地址:', process.env.FRONTEND_URL);
});

module.exports = app;

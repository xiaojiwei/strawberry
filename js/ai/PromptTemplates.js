/**
 * AI流程图生成 - 提示词模板库
 * 为各种大模型提供优化的提示词模板
 */

var PromptTemplates = (function() {
    'use strict';

    // 系统提示词 - 流程图生成专家
    var SYSTEM_PROMPT = `你是一个专业的流程图生成助手。根据用户的自然语言描述，生成结构化的流程图数据。

## 节点类型说明
- start: 开始节点（流程起点，椭圆形）
- end: 结束节点（流程终点，椭圆形）
- process: 处理步骤（具体操作，矩形）
- decision: 判断分支（条件判断，菱形）
- data: 数据节点（数据输入输出，平行四边形）
- document: 文档节点（文档处理，带波浪底边的矩形）

## 返回格式（严格JSON，不要包含markdown代码块标记）
{
  "nodes": [
    {
      "id": "唯一标识符（如node1, node2...）",
      "type": "节点类型（start/end/process/decision/data/document）",
      "label": "节点标题（简短，3-10个字）",
      "content": "节点详细内容（可选，不超过30字）"
    }
  ],
  "edges": [
    {
      "from": "起始节点ID",
      "to": "目标节点ID",
      "label": "连接线标签（如：是/否/下一步，可为空）"
    }
  ]
}

## 设计规则
1. 每个流程图必须有且仅有一个start节点
2. 至少有一个end节点（可以有多个结束分支）
3. decision节点必须有至少2个出边（通常标记为"是"和"否"或"通过"和"拒绝"）
4. 所有节点ID必须唯一，使用简单的命名如node1, node2, node3...
5. 边的from和to必须引用已存在的节点ID
6. 节点标签应简洁明了，避免冗长描述
7. 流程应该逻辑清晰，没有悬空节点（除了start和end）
8. 对于复杂流程，合理使用分支和循环结构

## 响应格式要求
- 直接返回JSON对象，不要包含markdown代码块标记
- 确保JSON格式正确，可以被JSON.parse()解析
- 不要添加注释或额外的说明文字`;

    // Few-shot示例：为大模型提供参考
    var EXAMPLES = [
        {
            description: "用户登录流程",
            response: {
                nodes: [
                    {id: "node1", type: "start", label: "开始", content: "用户访问登录页"},
                    {id: "node2", type: "process", label: "输入凭证", content: "输入用户名和密码"},
                    {id: "node3", type: "decision", label: "验证凭证", content: "检查用户名密码是否正确"},
                    {id: "node4", type: "process", label: "登录成功", content: "创建会话并跳转到主页"},
                    {id: "node5", type: "process", label: "显示错误", content: "显示错误提示信息"},
                    {id: "node6", type: "end", label: "结束", content: ""}
                ],
                edges: [
                    {from: "node1", to: "node2", label: ""},
                    {from: "node2", to: "node3", label: "提交"},
                    {from: "node3", to: "node4", label: "是"},
                    {from: "node3", to: "node5", label: "否"},
                    {from: "node4", to: "node6", label: ""},
                    {from: "node5", to: "node2", label: "重试"}
                ]
            }
        },
        {
            description: "在线购物结账流程",
            response: {
                nodes: [
                    {id: "node1", type: "start", label: "开始", content: ""},
                    {id: "node2", type: "process", label: "浏览商品", content: "用户浏览商品列表"},
                    {id: "node3", type: "process", label: "选择商品", content: "选择要购买的商品"},
                    {id: "node4", type: "decision", label: "库存充足？", content: "检查商品库存"},
                    {id: "node5", type: "process", label: "加入购物车", content: "添加商品到购物车"},
                    {id: "node6", type: "process", label: "提示缺货", content: "显示缺货信息"},
                    {id: "node7", type: "process", label: "确认订单", content: "确认购物车商品"},
                    {id: "node8", type: "process", label: "选择支付方式", content: "选择支付方式"},
                    {id: "node9", type: "decision", label: "支付成功？", content: "处理支付结果"},
                    {id: "node10", type: "process", label: "生成订单", content: "生成订单并发送确认"},
                    {id: "node11", type: "process", label: "支付失败", content: "显示失败原因"},
                    {id: "node12", type: "end", label: "完成", content: ""}
                ],
                edges: [
                    {from: "node1", to: "node2", label: ""},
                    {from: "node2", to: "node3", label: ""},
                    {from: "node3", to: "node4", label: ""},
                    {from: "node4", to: "node5", label: "是"},
                    {from: "node4", to: "node6", label: "否"},
                    {from: "node5", to: "node7", label: ""},
                    {from: "node6", to: "node2", label: "继续浏览"},
                    {from: "node7", to: "node8", label: ""},
                    {from: "node8", to: "node9", label: ""},
                    {from: "node9", to: "node10", label: "是"},
                    {from: "node9", to: "node11", label: "否"},
                    {from: "node10", to: "node12", label: ""},
                    {from: "node11", to: "node8", label: "重试"}
                ]
            }
        },
        {
            description: "文档审批流程",
            response: {
                nodes: [
                    {id: "node1", type: "start", label: "开始", content: ""},
                    {id: "node2", type: "document", label: "提交文档", content: "员工提交审批文档"},
                    {id: "node3", type: "process", label: "部门经理审批", content: "部门经理审核文档"},
                    {id: "node4", type: "decision", label: "经理批准？", content: ""},
                    {id: "node5", type: "process", label: "总经理审批", content: "总经理最终审核"},
                    {id: "node6", type: "decision", label: "总经理批准？", content: ""},
                    {id: "node7", type: "process", label: "审批通过", content: "文档审批通过并归档"},
                    {id: "node8", type: "process", label: "驳回修改", content: "返回给员工修改"},
                    {id: "node9", type: "end", label: "结束", content: ""}
                ],
                edges: [
                    {from: "node1", to: "node2", label: ""},
                    {from: "node2", to: "node3", label: ""},
                    {from: "node3", to: "node4", label: ""},
                    {from: "node4", to: "node5", label: "批准"},
                    {from: "node4", to: "node8", label: "驳回"},
                    {from: "node5", to: "node6", label: ""},
                    {from: "node6", to: "node7", label: "批准"},
                    {from: "node6", to: "node8", label: "驳回"},
                    {from: "node7", to: "node9", label: ""},
                    {from: "node8", to: "node2", label: "重新提交"}
                ]
            }
        }
    ];

    // 构建包含示例的完整提示词
    function buildPromptWithExamples(userDescription) {
        var prompt = SYSTEM_PROMPT + '\n\n## 参考示例\n\n';

        // 添加示例
        EXAMPLES.forEach(function(example, index) {
            prompt += '示例' + (index + 1) + '：\n';
            prompt += '用户描述：' + example.description + '\n';
            prompt += '返回JSON：\n' + JSON.stringify(example.response, null, 2) + '\n\n';
        });

        prompt += '## 现在请根据以下用户描述生成流程图：\n';
        prompt += userDescription;

        return prompt;
    }

    // 为OpenAI构建消息格式
    function buildOpenAIMessages(userDescription) {
        return [
            {
                role: 'system',
                content: SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: '示例1：用户登录流程'
            },
            {
                role: 'assistant',
                content: JSON.stringify(EXAMPLES[0].response)
            },
            {
                role: 'user',
                content: '示例2：在线购物结账流程'
            },
            {
                role: 'assistant',
                content: JSON.stringify(EXAMPLES[1].response)
            },
            {
                role: 'user',
                content: userDescription
            }
        ];
    }

    // 为Claude构建消息格式
    function buildClaudeMessages(userDescription) {
        var examplesText = '';
        EXAMPLES.forEach(function(example, index) {
            examplesText += '示例' + (index + 1) + '：\n';
            examplesText += '用户：' + example.description + '\n';
            examplesText += '助手：' + JSON.stringify(example.response) + '\n\n';
        });

        return [
            {
                role: 'user',
                content: examplesText + '\n现在请处理以下请求：\n' + userDescription
            }
        ];
    }

    // 为通用模型构建单一提示词
    function buildGenericPrompt(userDescription) {
        return buildPromptWithExamples(userDescription);
    }

    // 公共接口
    return {
        SYSTEM_PROMPT: SYSTEM_PROMPT,
        EXAMPLES: EXAMPLES,
        buildOpenAIMessages: buildOpenAIMessages,
        buildClaudeMessages: buildClaudeMessages,
        buildGenericPrompt: buildGenericPrompt,
        buildPromptWithExamples: buildPromptWithExamples
    };
})();

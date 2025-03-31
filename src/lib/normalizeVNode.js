export function normalizeVNode(vNode) {
  if (typeof vNode === "string") {
    return vNode;
  }

  if (typeof vNode === "number") {
    return String(vNode);
  }

  if (vNode == null || typeof vNode === "boolean" || vNode === undefined) {
    return "";
  }

  if (typeof vNode.type === "function") {
    const functionNode = vNode.type({
      children: vNode.children,
      ...vNode.props,
    });

    return normalizeVNode(functionNode);
  }

  return {
    ...vNode,
    children: vNode.children.map(normalizeVNode),
  };
}

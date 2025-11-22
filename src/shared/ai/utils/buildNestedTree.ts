

export function buildNestedTree(comments: any[]) {
  const map: Record<string, any> = {};
  const roots: any[] = [];

  comments.forEach((c) => {
    map[c._id] = { ...c, replies: [] };
  });

  comments.forEach((c) => {
    if (c.replyTo) {
      map[c.replyTo]?.replies.push(map[c._id]);
    } else {
      roots.push(map[c._id]);
    }
  });

  return roots;
}

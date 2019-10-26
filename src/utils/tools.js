
let req = async (fun, reqUrl, reqData) => {
  let res = await request({
    url: reqUrl,
    method: "post",
    data: reqData
  });
  if (res) fun(res);
  else fun({
    dataList: null
  });
}


let formatDate = {
  objToStr(d) {
    if (typeof d == 'object') {
      return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    } else {
      return d;
    }
  },
  numToStr(d) {
    if (typeof d == 'number') {
      let t = new Date(d);
      return t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate();
    } else {
      return d;
    }
  },
  numToString(d) {
    if (typeof d == 'number') {
      let t = new Date(d);
      return t.getFullYear() + "年" + (t.getMonth() + 1) + "月" + t.getDate() + "日";
    } else {
      return d;
    }
  },
  numToTime(d) {
    if (typeof d == 'number') {
      let t = new Date(d);
      return t.getHours() + ":" + t.getMinutes();
    } else {
      return d;
    }
  },
  strToTime(d) {
    if (typeof d == 'string') {
      let t = new Date(d)
      return t.getHours() + ":" + (t.getMinutes() < 10 ? 0 + "" + t.getMinutes() : t.getMinutes());
    } else {
      return d;
    }
  },
}


export {
  queryDectanory,
  formatDate
};

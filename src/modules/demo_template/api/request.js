import axios from "axios";
import qs from "qs";
import merge from "lodash/merge"
import isEmpty from 'lodash/isEmpty'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式

let fetch = async (options) => {
  let {
    method = 'get',
    data,
    url,
    headers
  } = options
  if (!data) {
    data = {}
  }
  let instance = axios.create({
    headers: headers
  });
  switch (method.toLowerCase()) {
    case 'get':
      return await instance.get(`${url}${!isEmpty(data) ? `?${qs.stringify(data)}` : ''}`)
    case 'delete':
      return await instance.delete(url, {data})
    case 'head':
      return await instance.head(url, data)
    case 'post':
      return await instance.post(url, data)
    case 'put':
      return await instance.put(url, data)
    case 'patch':
      return await instance.patch(url, data)
    default:
      return await instance(options)
  }
}

let request = async (options) => {
  NProgress.start();
  let result = null;
  try {
    result = await fetch(options);
    NProgress.done();
    const {statusText, status, data} = result
    if (data.code === 0 && data.error) {
    }
    return data
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
    } else {
    }
    return result;
  }
}

export {
  request
} ;








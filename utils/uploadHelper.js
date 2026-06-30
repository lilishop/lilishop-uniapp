import storage from "@/utils/storage.js";
import { upload as uploadUrl } from "@/api/common.js";

export function getUploadHeader() {
  return { accessToken: storage.getAccessToken() };
}

export function getUploadedUrls(fileList) {
  return fileList
    .filter((item) => item.status === "success" && item.url)
    .map((item) => item.url);
}

/**
 * uView Plus u-upload @afterRead handler for lilishop upload API.
 * Backend returns { result: "fileUrl", ... }.
 */
export function handleUploadAfterRead(event, fileList, onSuccess) {
  const files = [].concat(event.file);
  files.forEach((file) => {
    const index = fileList.length;
    fileList.push({
      ...file,
      status: "uploading",
      message: "上传中",
    });
    uni.uploadFile({
      url: uploadUrl,
      filePath: file.url,
      name: "file",
      header: getUploadHeader(),
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          fileList.splice(index, 1, {
            ...fileList[index],
            status: "success",
            message: "",
            url: data.result,
          });
          if (onSuccess) {
            onSuccess(getUploadedUrls(fileList));
          }
        } catch (e) {
          fileList.splice(index, 1, {
            ...fileList[index],
            status: "failed",
            message: "上传失败",
          });
        }
      },
      fail: () => {
        fileList.splice(index, 1, {
          ...fileList[index],
          status: "failed",
          message: "上传失败",
        });
      },
    });
  });
}

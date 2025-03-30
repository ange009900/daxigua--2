"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  ImageIcon,
  Italic,
  Save,
  Send,
  Text,
  Trash2,
  Upload,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"
import dynamic from "next/dynamic"
import Script from "next/script"

// T恤颜色
const COLORS = [
  { name: "白色", value: "#FFFFFF" },
  { name: "黑色", value: "#000000" },
  { name: "海军蓝", value: "#000080" },
  { name: "红色", value: "#FF0000" },
  { name: "绿色", value: "#008000" },
  { name: "黄色", value: "#FFFF00" },
  { name: "紫色", value: "#800080" },
  { name: "灰色", value: "#808080" },
]

// T恤尺码
const SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"]

export default function TShirtDesigner() {
  const isMobile = useMobile()
  const canvasRef = useRef<any>(null)
  const canvasElRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const shirtImageRef = useRef<HTMLImageElement | null>(null)

  const [color, setColor] = useState(COLORS[0].value)
  const [size, setSize] = useState(SIZES[1])
  const [text, setText] = useState("")
  const [textColor, setTextColor] = useState("#000000")
  const [fontSize, setFontSize] = useState(24)
  const [fontStyle, setFontStyle] = useState({ bold: false, italic: false })
  const [textAlign, setTextAlign] = useState("center")
  const [selectedObject, setSelectedObject] = useState<any>(null)

  // 初始化画布
  useEffect(() => {
    const initCanvas = () => {
      if (!canvasElRef.current || canvasRef.current) return;
      
      if (typeof window === 'undefined' || !window.fabric) {
        console.error('fabric.js 未加载');
        return;
      }

      try {
        console.log('开始初始化画布...');
        const canvas = new window.fabric.Canvas(canvasElRef.current, {
          width: 400,
          height: 500,
          backgroundColor: "transparent",
        });

        canvasRef.current = canvas;

        // 处理选择变化
        canvas.on("selection:created", (e: any) => {
          if (e.selected && e.selected[0]) {
            setSelectedObject(e.selected[0]);
          }
        });

        canvas.on("selection:updated", (e: any) => {
          if (e.selected && e.selected[0]) {
            setSelectedObject(e.selected[0]);
          }
        });

        canvas.on("selection:cleared", () => {
          setSelectedObject(null);
        });

        console.log('画布初始化成功');
      } catch (error) {
        console.error("初始化画布时出错:", error);
      }
    };

    // 如果fabric.js已加载，直接初始化
    if (window.fabric) {
      initCanvas();
    }

    // 清理函数
    return () => {
      if (canvasRef.current) {
        try {
          canvasRef.current.clear();
          canvasRef.current.off();
          canvasRef.current = null;
        } catch (error) {
          console.error("清理画布时出错:", error);
        }
      }
    };
  }, []);

  // 获取色相旋转值
  const getHueRotate = (hexColor: string) => {
    // 将十六进制颜色转换为RGB
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)

    // 计算HSL
    const max = Math.max(r, g, b) / 255
    const min = Math.min(r, g, b) / 255
    const l = (max + min) / 2
    let h = 0
    let s = 0

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
      else if (max === g) h = (b - r) / d + 2
      else if (max === b) h = (r - g) / d + 4

      h *= 60
    }

    return h
  }

  // 获取饱和度和亮度调整
  const getColorAdjustments = (hexColor: string) => {
    switch (hexColor.toUpperCase()) {
      case "#000000":
        return { brightness: 0, saturation: 0 } // 黑色
      case "#FFFFFF":
        return { brightness: 1, saturation: 0 } // 白色
      case "#FF0000":
        return { brightness: 0.9, saturation: 2 } // 红色
      case "#000080":
        return { brightness: 0.7, saturation: 2 } // 海军蓝
      case "#008000":
        return { brightness: 0.8, saturation: 2 } // 绿色
      case "#FFFF00":
        return { brightness: 1, saturation: 1.5 } // 黄色
      case "#800080":
        return { brightness: 0.7, saturation: 2 } // 紫色
      case "#808080":
        return { brightness: 0.7, saturation: 0.5 } // 灰色
      default:
        return { brightness: 1, saturation: 1 }
    }
  }

  // 更新T恤颜色
  useEffect(() => {
    const shirtImage = shirtImageRef.current
    if (shirtImage) {
      if (color !== "#FFFFFF") {
        const hue = getHueRotate(color)
        const { brightness, saturation } = getColorAdjustments(color)
        shirtImage.style.filter = `brightness(${brightness}) sepia(1) hue-rotate(${hue}deg) saturate(${saturation})`
      } else {
        shirtImage.style.filter = "none"
      }
    }
  }, [color])

  // 添加文字到画布
  const addText = () => {
    if (!canvasRef.current || !text || !window.fabric) return;

    try {
      const fabricText = new window.fabric.Text(text, {
        left: 200,
        top: 250,
        originX: "center",
        originY: "center",
        fontFamily: "Arial",
        fontSize,
        fontWeight: fontStyle.bold ? "bold" : "normal",
        fontStyle: fontStyle.italic ? "italic" : "normal",
        fill: textColor,
        textAlign: textAlign as any,
        cornerSize: 6,
        transparentCorners: true,
        cornerColor: "transparent",
        borderColor: "transparent",
        padding: 0
      });

      canvasRef.current.add(fabricText);
      canvasRef.current.setActiveObject(fabricText);
      canvasRef.current.renderAll();
      setText("");
    } catch (error) {
      console.error("添加文字时出错:", error);
    }
  };

  // 上传图片
  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvasRef.current || !e.target.files || e.target.files.length === 0 || !window.fabric) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (f) => {
      const data = f.target?.result;
      if (!data) return;

      try {
        window.fabric.Image.fromURL(data.toString(), (img: any) => {
          // 缩放图片以适应设计区域
          const maxWidth = 180;
          const maxHeight = 180;

          if (img.width && img.height) {
            if (img.width > maxWidth) {
              img.scaleToWidth(maxWidth);
            }
            if (img.height! * img.scaleY! > maxHeight) {
              img.scaleToHeight(maxHeight);
            }
          }

          img.set({
            left: 200,
            top: 250,
            originX: "center",
            originY: "center",
            selectable: true,
            hasControls: true,
            hasBorders: true,
            cornerSize: 6,
            transparentCorners: true,
            cornerColor: "transparent",
            borderColor: "transparent",
            padding: 0
          });

          canvasRef.current?.add(img);
          canvasRef.current?.setActiveObject(img);
          canvasRef.current?.renderAll();
        });
      } catch (error) {
        console.error("处理图片时出错:", error);
      }
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // 删除选中的对象
  const deleteSelectedObject = () => {
    if (!canvasRef.current || !selectedObject) return

    canvasRef.current.remove(selectedObject)
    canvasRef.current.renderAll()
    setSelectedObject(null)
  }

  // 本地保存设计
  const saveDesign = () => {
    if (!canvasRef.current) return

    const designData = {
      canvas: canvasRef.current.toJSON(),
      color,
      size,
    }

    localStorage.setItem("tshirtDesign", JSON.stringify(designData))
    alert("设计已成功保存！")
  }

  // 加载保存的设计
  const loadDesign = () => {
    const savedDesign = localStorage.getItem("tshirtDesign")
    if (!savedDesign || !canvasRef.current) return

    try {
      const designData = JSON.parse(savedDesign)

      // 清除画布
      canvasRef.current.clear()

      // 加载画布对象
      canvasRef.current.loadFromJSON(designData.canvas, () => {
        canvasRef.current?.renderAll()
      })

      // 恢复其他设置
      setColor(designData.color)
      setSize(designData.size)

      alert("设计已成功加载！")
    } catch (error) {
      console.error("加载设计时出错:", error)
      alert("加载设计失败")
    }
  }

  // 提交设计到后端
  const submitDesign = () => {
    if (!canvasRef.current) return

    // 获取画布数据
    const designImage = canvasRef.current.toDataURL({
      format: "png",
      quality: 1,
    })

    const designData = {
      image: designImage,
      color,
      size,
    }

    // 这里你可以将数据发送到后端
    console.log("提交设计到后端:", designData)
    alert("设计已成功提交！")

    // 示例API调用（已注释）
    /*
    fetch('/api/submit-design', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(designData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('成功:', data);
        alert('设计已成功提交！');
      })
      .catch((error) => {
        console.error('错误:', error);
        alert('提交设计失败');
      });
    */
  }

  // 下载设计为图片
  const downloadDesign = () => {
    if (!canvasRef.current || !shirtImageRef.current) return;

    // 创建临时画布
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // 设置临时画布大小
    tempCanvas.width = 400;
    tempCanvas.height = 500;

    // 绘制T恤底图
    tempCtx.drawImage(shirtImageRef.current, 0, 0, 400, 500);

    // 获取当前设计的数据URL
    const designDataUrl = canvasRef.current.toDataURL({
      format: "png",
      quality: 1,
    });

    // 创建新图片对象加载设计
    const designImg = new Image();
    designImg.onload = () => {
      // 在底图上绘制设计
      tempCtx.drawImage(designImg, 0, 0, 400, 500);

      // 获取最终的数据URL
      const finalDataUrl = tempCanvas.toDataURL('image/png');

      // 创建下载链接
      const downloadLink = document.createElement("a");
      downloadLink.href = finalDataUrl;
      downloadLink.download = `t恤设计-${new Date().getTime()}.png`;

      // 触发下载
      downloadLink.click();
    };
    designImg.src = designDataUrl;
  }

  // 修改导出选项
  const exportOptions = {
    format: "png",
    quality: 1,
    multiplier: 2
  }

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"
        strategy="beforeInteractive"
      />
      <div className="flex flex-col lg:flex-row h-full min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* 左侧控制面板 */}
        <div className="w-full lg:w-1/3 p-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <h1 className="text-2xl font-bold mb-4 text-center">T恤设计器</h1>

          <Tabs defaultValue="color">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="color">颜色</TabsTrigger>
              <TabsTrigger value="design">设计</TabsTrigger>
              <TabsTrigger value="save">保存</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-180px)] lg:h-[calc(100vh-150px)]">
              <TabsContent value="color" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">T恤颜色</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map((c) => (
                      <div
                        key={c.value}
                        className={`h-10 rounded-md cursor-pointer border-2 ${
                          color === c.value ? "border-primary" : "border-gray-200 dark:border-gray-700"
                        }`}
                        style={{ backgroundColor: c.value }}
                        onClick={() => setColor(c.value)}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">尺码</h3>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">尺码</h3>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((s) => (
                        <label key={s} className="flex items-center">
                          <input
                            type="radio"
                            name="size"
                            value={s}
                            checked={size === s}
                            onChange={(e) => setSize(e.target.value)}
                            className="mr-1"
                          />
                          <span className="text-sm">{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="design" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">添加图片</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">上传图片添加到您的设计中</p>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    上传图片
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={uploadImage} />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">添加文字</h3>
                  <Textarea
                    placeholder="在此输入您的文字"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="resize-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="text-color">文字颜色</Label>
                      <Input
                        id="text-color"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-10 p-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="font-size">字体大小</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="font-size"
                          min={10}
                          max={72}
                          step={1}
                          value={[fontSize]}
                          onValueChange={(value) => setFontSize(value[0])}
                        />
                        <span className="w-8 text-center">{fontSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant={fontStyle.bold ? "default" : "outline"}
                      size="icon"
                      onClick={() => setFontStyle({ ...fontStyle, bold: !fontStyle.bold })}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={fontStyle.italic ? "default" : "outline"}
                      size="icon"
                      onClick={() => setFontStyle({ ...fontStyle, italic: !fontStyle.italic })}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          {textAlign === "left" && <AlignLeft className="h-4 w-4" />}
                          {textAlign === "center" && <AlignCenter className="h-4 w-4" />}
                          {textAlign === "right" && <AlignRight className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setTextAlign("left")}>
                          <AlignLeft className="mr-2 h-4 w-4" />
                          <span>左对齐</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTextAlign("center")}>
                          <AlignCenter className="mr-2 h-4 w-4" />
                          <span>居中</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTextAlign("right")}>
                          <AlignRight className="mr-2 h-4 w-4" />
                          <span>右对齐</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button className="flex-1" onClick={addText} disabled={!text}>
                      <Text className="mr-2 h-4 w-4" />
                      添加文字
                    </Button>
                  </div>
                </div>

                {selectedObject && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">已选元素</h3>
                      <Button variant="destructive" onClick={deleteSelectedObject} className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除所选
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="save" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">保存与导出</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">保存您的设计或提交</p>

                  <div className="grid gap-2">
                    <Button variant="outline" onClick={saveDesign} className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      保存草稿
                    </Button>

                    <Button variant="outline" onClick={loadDesign} className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      加载草稿
                    </Button>

                    <Button variant="outline" onClick={downloadDesign} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      下载设计
                    </Button>

                    <Separator />

                    <Button onClick={submitDesign} className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      提交设计
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* 右侧预览区域 */}
        <div className="w-full lg:w-2/3 p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-900 min-h-[500px]">
          <div className="relative">
            <div className="relative w-[400px] h-[500px] rounded-lg">
              {/* T恤基础图片 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  ref={shirtImageRef}
                  src="/images/shirt.png"
                  alt="T恤模板"
                  width={400}
                  height={500}
                  className="object-contain transition-all duration-300"
                  style={{ willChange: "filter" }}
                />
              </div>

              {/* 设计画布 */}
              <canvas ref={canvasElRef} className="absolute inset-0" />

              {/* 尺码指示器 */}
              <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-full px-3 py-1 flex items-center justify-center text-xs font-bold border">
                {size}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


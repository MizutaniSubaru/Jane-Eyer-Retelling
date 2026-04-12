import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export function DesignNotes({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-[#1f1b24]/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 w-full max-w-3xl max-h-full overflow-y-auto rounded-md bg-[#2b2533]/90 border border-[#a3b5c6]/20 shadow-2xl p-8 md:p-12 text-[#f2efe9] scrollbar-hide panel-emboss"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-[#a3b5c6]/60 hover:text-[#f2efe9] transition-colors"
            >
              <X size={24} strokeWidth={1} />
            </button>

            <h2 className="text-3xl font-serif text-[#a3b5c6] tracking-wider mb-8 flex items-center gap-4">
              过渡动画设计说明
              <span className="flex-1 h-[1px] bg-gradient-to-r from-[#a3b5c6]/30 to-transparent" />
            </h2>

            <div className="space-y-8 font-serif text-lg leading-relaxed tracking-wide opacity-90 font-light">
              <section>
                <h3 className="text-xl text-[#f2efe9] mb-3">总原则</h3>
                <p className="text-[#a3b5c6]">
                  缓慢、克制、柔和。以淡入淡出、微位移、层次呼吸感为主。避免任何弹跳、高能发光、旋转飞入或夸张缩放。
                </p>
              </section>

              <section>
                <h3 className="text-xl text-[#f2efe9] mb-3">1. 开始界面 → 主界面</h3>
                <p className="text-[#a3b5c6]">
                  像翻开小说扉页，背景从远景缓慢呼吸。点击后，标题与按钮轻柔淡出，主界面背景缓慢淡入，顶部控制栏和底部对话框延迟 0.5 秒出现，呈现“从书外进入书中”的文学感。
                </p>
              </section>

              <section>
                <h3 className="text-xl text-[#f2efe9] mb-3">2. 主界面对白推进动画</h3>
                <p className="text-[#a3b5c6]">
                  点击“下一句”时，不发生整页跳动，仅文字区域轻微淡出再淡入（0.9 秒过渡）。背景保持稳定极缓慢的视差呼吸。对白切换如同平静阅读，沉浸且私密。
                </p>
              </section>

              <section>
                <h3 className="text-xl text-[#f2efe9] mb-3">3. 选择框出现</h3>
                <p className="text-[#a3b5c6]">
                  对白结束停顿后，选择框从对白框上方轻微上浮（0.8 秒）。2~4 个选项按 0.12 秒错落依次出现，仿佛内心的想法逐渐成形。此时底部对话框会轻微退去焦点（模糊且缩小至 95%）。
                </p>
              </section>

              <section>
                <h3 className="text-xl text-[#f2efe9] mb-3">4. 选择框悬停与选中</h3>
                <p className="text-[#a3b5c6]">
                  悬停时：背景轻微提亮，显现书页质感的微光。选中时：背景短暂加深层次，非选项隐去，选中项保留 0.8 秒视觉停留后再进入下一句。
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

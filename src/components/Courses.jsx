"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import PageLayout from "@/components/PageLayout"
import { useTranslations } from "next-intl"
import { FaCss3Alt, FaHtml5, FaJs, FaReact } from "react-icons/fa"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"

const coursesData = [
  { icon: <FaHtml5 className="text-orange-500 text-3xl" />, key: "html" },
  { icon: <FaCss3Alt className="text-blue-500 text-3xl" />, key: "css" },
  { icon: <FaJs className="text-yellow-400 text-3xl" />, key: "js" },
  { icon: <FaReact className="text-cyan-400 text-3xl" />, key: "react" },
]

const spring = { type: "spring", stiffness: 420, damping: 38, mass: 0.85 }

// map "level" -> color badge
const levelColor = (level) => {
  const s = String(level || "").toLowerCase()
  if (s.includes("beginner")) return "bg-emerald-500/90"
  if (s.includes("intermediate")) return "bg-amber-500/90"
  if (s.includes("advanced")) return "bg-violet-500/90"
  return "bg-slate-500/80"
}

// default progress per course (you can later wire this to real user progress)
const defaultProgress = {
  html: 35,
  css: 65,
  js: 45,
  react: 20,
}

export default function CoursesHero() {
  const t = useTranslations()
  const [activeKey, setActiveKey] = useState(null)
  const wrapRef = useRef(null)

  const active = useMemo(
    () => coursesData.find((c) => c.key === activeKey),
    [activeKey]
  )

  const open = (key) => setActiveKey(key)
  const close = () => setActiveKey(null)

  // ESC close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // outside click close (only in expanded)
  useEffect(() => {
    if (!activeKey) return
    const onDown = (e) => {
      const el = wrapRef.current
      if (!el) return
      if (!el.contains(e.target)) close()
    }
    window.addEventListener("mousedown", onDown)
    window.addEventListener("touchstart", onDown, { passive: true })
    return () => {
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("touchstart", onDown)
    }
  }, [activeKey])

  return (
    <PageLayout
      title={t("courses.title")}
      id="courses"
      className="py-16 px-4 bg-gray-100 dark:bg-gray-800"
    >
      <div className="max-w-6xl mx-auto">
        <LayoutGroup>
          <AnimatePresence initial={false} mode="popLayout">
            {/* ===================== */}
            {/* STANDARD VIEW */}
            {/* ===================== */}
            {!activeKey ? (
              <motion.div
                key="standard"
                layout
                transition={spring}
                className="grid gap-6 sm:grid-cols-2 md:grid-cols-4"
              >
                {coursesData.map((course) => (
                  <motion.button
                    key={course.key}
                    layout
                    transition={spring}
                    onClick={() => open(course.key)}
                    className="
                      text-left rounded-2xl border
                      bg-white/90 dark:bg-gray-900/80
                      border-gray-200 dark:border-gray-700
                      p-6 shadow-sm hover:shadow-xl
                      active:scale-[0.99]
                      transition
                    "
                  >
                    <div className="mb-4">{course.icon}</div>
                    <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                      {t(`courses.${course.key}.title`)}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t(`courses.${course.key}.desc`)}
                    </p>

                    {/* badges */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                        {t(`courses.${course.key}.badge1`)}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                        {t(`courses.${course.key}.badge2`)}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              /* ===================== */
              /* EXPANDED VIEW */
              /* Left tabs + connected panel + pro UI */
              /* ===================== */
              <motion.div
                key="expanded"
                ref={wrapRef}
                layout
                transition={spring}
                className="
                  grid gap-6 items-stretch
                  rounded-[28px]
                  bg-gradient-to-br from-slate-900/35 to-slate-900/20
                  p-6
                "
                style={{ gridTemplateColumns: "96px minmax(0,1fr)" }}
              >
                {/* LEFT TABS */}
                <motion.div
                  layout
                  transition={spring}
                  className="relative grid gap-4 content-start"
                >
                  {coursesData.map((course) => {
                    const isActive = course.key === activeKey

                    return (
                      <motion.button
                        key={course.key}
                        layout
                        transition={spring}
                        onClick={() => open(course.key)}
                        className={`
                          relative w-full aspect-square
                          grid place-items-center
                          rounded-2xl border
                          bg-white/10 dark:bg-gray-900/40
                          border-white/10 dark:border-white/10
                          shadow-sm hover:shadow-md
                          active:scale-[0.98]
                          transition

                          ${isActive ? `
                            z-30
                            shadow-xl
                            -mr-6
                            rounded-r-none
                            border-r-0
                            bg-white/12 dark:bg-gray-900/55
                          ` : `
                            opacity-80 hover:opacity-100
                          `}
                        `}
                        aria-label={course.key}
                      >
                        {/* Active highlight ring */}
                        {isActive && (
                          <motion.div
                            layoutId="tab-highlight"
                            transition={spring}
                            className="
                              pointer-events-none absolute inset-0
                              rounded-2xl rounded-r-none
                              ring-2 ring-white/10
                            "
                          />
                        )}

                        {/* Small active side bar */}
                        {isActive && (
                          <motion.div
                            layoutId="active-bar"
                            transition={spring}
                            className="absolute left-2 top-4 bottom-4 w-1 rounded-full bg-white/30"
                          />
                        )}

                        <div className="relative">{course.icon}</div>
                      </motion.button>
                    )
                  })}
                </motion.div>

                {/* RIGHT BIG PANEL */}
                <motion.div
                  layout
                  transition={spring}
                  className="
                    relative rounded-2xl
                    border border-white/10
                    bg-white/10 dark:bg-gray-900/40
                    shadow-xl overflow-hidden
                    ml-[-1px]
                    courses-panel-notch
                  "
                >
                  {/* glow */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-28 -right-28 h-72 w-72 rounded-full blur-3xl bg-gradient-to-br from-indigo-400/18 via-fuchsia-300/12 to-cyan-300/12" />
                    <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full blur-3xl bg-gradient-to-tr from-emerald-300/10 via-sky-300/10 to-violet-300/10" />
                  </div>

                  {/* seam fix */}
                  <div className="pointer-events-none absolute left-0 top-0 h-6 w-[96px]">
                    <div className="absolute left-0 top-0 h-px w-full bg-white/10" />
                  </div>

                  <div className="relative p-8">
                    {/* header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-2xl font-bold text-white">
                          {t(`courses.${active.key}.title`)}
                        </h3>
                        <p className="mt-2 text-white/70">
                          {t(`courses.${active.key}.desc`)}
                        </p>

                        {/* meta badges */}
                        <div className="flex flex-wrap gap-3 mt-4">
                          <span
                            className={`
                              text-xs px-3 py-1 rounded-full text-white
                              ${levelColor(t(`courses.${active.key}.level`))}
                            `}
                          >
                            {t(`courses.${active.key}.level`)}
                          </span>

                          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white">
                            ⏱ {t(`courses.${active.key}.duration`)}
                          </span>

                          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white">
                            🚀 {t(`courses.${active.key}.projects`)}
                          </span>

                          {/* quick badges from translations */}
                          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white">
                            {t(`courses.${active.key}.badge1`)}
                          </span>
                          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white">
                            {t(`courses.${active.key}.badge2`)}
                          </span>
                        </div>

                        {/* animated progress */}
                        <div className="mt-6">
                          <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span>Course progress</span>
                            <span>{defaultProgress[active.key] ?? 0}%</span>
                          </div>

                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              key={active.key}
                              initial={{ width: 0 }}
                              animate={{ width: `${defaultProgress[active.key] ?? 0}%` }}
                              transition={{ duration: 0.6 }}
                              className="
                                h-full
                                bg-gradient-to-r
                                from-indigo-400
                                via-fuchsia-400
                                to-cyan-400
                              "
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={close}
                        className="
                          shrink-0 inline-flex items-center justify-center
                          rounded-xl px-3 py-2 text-sm font-semibold
                          border border-white/10
                          bg-white/10
                          hover:bg-white/15
                          text-white
                          transition
                        "
                      >
                        Close
                      </button>
                    </div>

                    {/* details + skills */}
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={active.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.22 }}
                        className="mt-6 grid gap-4"
                      >
                        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                          <div className="text-sm font-semibold text-white">
                            {t(`courses.${active.key}.detailsTitle`)}
                          </div>

                          <ul className="mt-2 space-y-2 text-sm text-white/80">
                            <li className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" />
                              <span>{t(`courses.${active.key}.point1`)}</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" />
                              <span>{t(`courses.${active.key}.point2`)}</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" />
                              <span>{t(`courses.${active.key}.point3`)}</span>
                            </li>
                          </ul>

                          {/* Skills chips from translations */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            {(t.raw(`courses.${active.key}.skills`) || []).map((skill) => (
                              <span
                                key={skill}
                                className="
                                  text-xs px-3 py-1 rounded-full
                                  bg-white/10
                                  border border-white/10
                                  text-white/80
                                  backdrop-blur
                                "
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-white/10 bg-black/10 p-4">
                          <div className="text-sm text-white/80">
                            <span className="font-semibold text-white">
                              {t(`courses.${active.key}.ctaHintStrong`)}
                            </span>{" "}
                            {t(`courses.${active.key}.ctaHint`)}
                          </div>

                          <button
                            type="button"
                            className="
                              inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold
                              bg-white text-black
                              hover:opacity-90 transition
                            "
                          >
                            {t(`courses.${active.key}.cta`)}
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </PageLayout>
  )
}
"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";
import { Label } from "../form/label";
import { MultiSelect } from "../input/multi-select";

type Tab = {
  title: string;
  value: string;
  content?: string | React.ReactNode | any;
};

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}) => {
  const [active, setActive] = useState<Tab>(propTabs[0]);
  const [tabs, setTabs] = useState<Tab[]>(propTabs);

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setTabs(newTabs);
    setActive(newTabs[0]);
  };

  const [hovering, setHovering] = useState(false);

  return (
    <>
      {/* Mobile: Dropdown */}
      <div className={cn("block md:hidden w-full my-6 flex self-center max-w-[450px] md:max-w-[834px] lg:max-w-[1220px]")}> 
        <LabelInputContainer className="mb-4">
          <Label className="text-primary-800 dark:text-primary-800 font-[outfit]! font-bold" htmlFor="tab-select">
            Select a training option:
          </Label>
          <MultiSelect
            options={propTabs.map(tab => ({ value: tab.value, label: tab.title }))}
            placeholder="Select a training option..."
            className="bg-grey-900 text-white font-outfit max-w-[450px] rounded-2xl border border-grey-800 shadow-lg"
            value={active.value}
            onChange={val => {
              const idx = propTabs.findIndex(tab => tab.value === val);
              if (idx !== -1) moveSelectedTabToTop(idx);
            }}
            singleSelect
          />
        </LabelInputContainer>
      </div>
      {/* Desktop/Tablet: Horizontal Tabs */}
      <div
        className={cn(
          "hidden md:flex flex-row items-center justify-center [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            onClick={() => {
              moveSelectedTabToTop(idx);
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={cn("relative px-4 py-2 rounded-full", tabClassName)}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {active.value === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute inset-0 bg-gray-200 dark:bg-zinc-800 rounded-full ",
                  activeTabClassName
                )}
              />
            )}

            <span className="relative block text-white font-[outfit]!">
              {tab.title}
            </span>
          </button>
        ))}
      </div>
      <FadeInDiv
        tabs={tabs}
        active={active}
        key={active.value}
        hovering={hovering}
        className={cn("mt-6 md:mt-24 lg:mt-32", contentClassName)}
      />
    </>
  );
};

export const FadeInDiv = ({
  className,
  tabs,
  active,
  hovering,
}: {
  className?: string;
  key?: string;
  tabs: Tab[];
  active: Tab;
  hovering?: boolean;
}) => {
  // Only render the active tab's content in the normal flow
  return (
    <div className={cn("relative w-full", className)}>
      <motion.div
        key={active.value}
        layoutId={active.value}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
        className="w-full"
      >
        {active.content}
      </motion.div>
      {hovering && tabs.slice(1, 4).map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: 0.7 - idx * 0.2,
            scale: 1 - (idx + 1) * 0.08,
            y: -40 * (idx + 1),
          }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          style={{ zIndex: -idx - 1 }}
          className="w-full absolute top-0 left-0 pointer-events-none"
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

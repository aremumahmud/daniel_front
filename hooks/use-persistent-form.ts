"use client"

import { useState, useEffect, useCallback } from "react"

interface UsePersistentFormOptions<T> {
  key: string
  initialData: T
  sections?: string[]
}

export function usePersistentForm<T extends Record<string, any>>({
  key,
  initialData,
  sections = []
}: UsePersistentFormOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData)
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(key)
      const savedSection = localStorage.getItem(`${key}_section`)
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setFormData({ ...initialData, ...parsedData })
      }
      
      if (savedSection) {
        const sectionIndex = parseInt(savedSection, 10)
        if (sectionIndex >= 0 && sectionIndex < sections.length) {
          setCurrentSection(sectionIndex)
        }
      }
    } catch (error) {
      console.error("Error loading form data from localStorage:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [key, initialData, sections.length])

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(key, JSON.stringify(formData))
      } catch (error) {
        console.error("Error saving form data to localStorage:", error)
      }
    }
  }, [formData, key, isLoaded])

  // Save current section to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(`${key}_section`, currentSection.toString())
      } catch (error) {
        console.error("Error saving section to localStorage:", error)
      }
    }
  }, [currentSection, key, isLoaded])

  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const updateNestedField = useCallback((path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = path.split('.')
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
  }, [])

  const clearFormData = useCallback(() => {
    try {
      localStorage.removeItem(key)
      localStorage.removeItem(`${key}_section`)
      setFormData(initialData)
      setCurrentSection(0)
    } catch (error) {
      console.error("Error clearing form data:", error)
    }
  }, [key, initialData])

  const goToSection = useCallback((sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < sections.length) {
      setCurrentSection(sectionIndex)
    }
  }, [sections.length])

  const nextSection = useCallback(() => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1)
    }
  }, [currentSection, sections.length])

  const previousSection = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1)
    }
  }, [currentSection])

  const getProgress = useCallback(() => {
    return ((currentSection + 1) / sections.length) * 100
  }, [currentSection, sections.length])

  const isFirstSection = currentSection === 0
  const isLastSection = currentSection === sections.length - 1

  return {
    formData,
    currentSection,
    isLoaded,
    updateFormData,
    updateField,
    updateNestedField,
    clearFormData,
    goToSection,
    nextSection,
    previousSection,
    getProgress,
    isFirstSection,
    isLastSection,
    setCurrentSection
  }
}

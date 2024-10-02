"use client"

import React, { useState } from 'react'
import { Tree, TreeNode } from 'react-organizational-chart'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trash2 } from "lucide-react"

type NodeType = 'outcome' | 'opportunity' | 'solution' | 'test'

interface TreeItem {
  id: string
  type: NodeType
  content: string
  children?: TreeItem[]
}

export default function OpportunitySolutionTree() {
  const [tree, setTree] = useState<TreeItem | null>(null)
  const [newItemContent, setNewItemContent] = useState('')
  const [targetOpportunity, setTargetOpportunity] = useState<string | null>(null)
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>([])

  const addItem = (parentId: string | null, type: NodeType) => {
    if (type === 'outcome' && tree) return // Only one outcome allowed

    const newItem: TreeItem = {
      id: Date.now().toString(),
      type,
      content: newItemContent,
      children: [],
    }

    if (!tree) {
      setTree(newItem)
    } else {
      const updatedTree = { ...tree }
      const parent = findItem(updatedTree, parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(newItem)
      }
      setTree(updatedTree)
    }

    setNewItemContent('')
  }

  const findItem = (item: TreeItem, id: string | null): TreeItem | null => {
    if (item.id === id) return item
    if (item.children) {
      for (const child of item.children) {
        const found = findItem(child, id)
        if (found) return found
      }
    }
    return null
  }

  const deleteItem = (id: string) => {
    const deleteFromChildren = (children: TreeItem[]) => {
      const index = children.findIndex(child => child.id === id)
      if (index !== -1) {
        children.splice(index, 1)
        return true
      }
      for (const child of children) {
        if (child.children && deleteFromChildren(child.children)) {
          return true
        }
      }
      return false
    }

    if (tree?.id === id) {
      setTree(null)
    } else if (tree) {
      const updatedTree = { ...tree }
      if (updatedTree.children) {
        deleteFromChildren(updatedTree.children)
        setTree(updatedTree)
      }
    }

    if (id === targetOpportunity) {
      setTargetOpportunity(null)
    }
    if (selectedSolutions.includes(id)) {
      setSelectedSolutions(selectedSolutions.filter(solutionId => solutionId !== id))
    }
  }

  const renderTreeNode = (item: TreeItem) => (
    <TreeNode
      label={
        <div className="flex justify-center">
          <Card className={`w-64 ${(item.type === 'opportunity' && item.id === targetOpportunity) || (item.type === 'solution' && selectedSolutions.includes(item.id)) ? 'border-primary' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</CardTitle>
              <Button onClick={() => deleteItem(item.id)} variant="ghost" size="icon" className="-mt-2 -mr-2">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-base">{item.content}</p>
              {item.type === 'opportunity' && (
                <Button
                  onClick={() => setTargetOpportunity(item.id === targetOpportunity ? null : item.id)}
                  variant={targetOpportunity === item.id ? "default" : "outline"}
                  className="mt-2 w-full"
                >
                  {targetOpportunity === item.id ? 'Unselect' : 'Select as Target'}
                </Button>
              )}
              {item.type === 'solution' && (
                <Button
                  onClick={() => {
                    if (selectedSolutions.includes(item.id)) {
                      setSelectedSolutions(selectedSolutions.filter(id => id !== item.id))
                    } else if (selectedSolutions.length < 3) {
                      setSelectedSolutions([...selectedSolutions, item.id])
                    }
                  }}
                  variant={selectedSolutions.includes(item.id) ? "default" : "outline"}
                  className="mt-2 w-full"
                >
                  {selectedSolutions.includes(item.id) ? 'Unselect' : 'Select to Explore'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      }
    >
      {item.children?.map(child => renderTreeNode(child))}
    </TreeNode>
  )

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Opportunity Solution Tree Builder</h1>
      
      <div className="mb-4">
        <Input
          type="text"
          value={newItemContent}
          onChange={(e) => setNewItemContent(e.target.value)}
          placeholder="Enter new item content"
          className="mr-2 text-lg"
        />
        <div className="mt-2 space-x-2">
          <Button
            onClick={() => addItem(tree ? tree.id : null, tree ? 'opportunity' : 'outcome')}
            className="mr-2"
          >
            {tree ? 'Add Opportunity' : 'Add Desired Outcome'}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={() => addItem(targetOpportunity, 'solution')}
                    disabled={!targetOpportunity}
                  >
                    Add Solution
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select a target opportunity first</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={() => {
                      const selectedSolution = selectedSolutions[selectedSolutions.length - 1]
                      addItem(selectedSolution, 'test')
                    }}
                    disabled={selectedSolutions.length === 0}
                  >
                    Add Assumption Test
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select a solution to explore first</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {tree && (
        <div className="overflow-auto">
          <Tree
            lineWidth={'2px'}
            lineColor={'#bbb'}
            lineBorderRadius={'10px'}
            label={<div className="text-center mb-4">Opportunity Solution Tree</div>}
            className="flex justify-center"
          >
            {renderTreeNode(tree)}
          </Tree>
        </div>
      )}
    </div>
  )
}
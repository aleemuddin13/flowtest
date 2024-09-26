import fs from 'fs'
import path from 'path'
import { FlowType } from '@/types'

const jsonFilePath = path.join(process.cwd(), './src/data/flow.json')

const getFlow = async () => {
    try {
        const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'))
        return data
    } catch (error) {
        return {
            nodes: [{
                "id": "1",
                "position": {
                    "x": 539,
                    "y": 61
                },
                "data": {
                    "label": "Start",
                    "isDisabled": false,
                    "isProcessing": false,
                    "output": ""
                },
                "type": "input",
                "measured": {
                    "width": 150,
                    "height": 40
                },
                "selected": false,
                "dragging": false
            }], edges: []
        }
    }
}


const saveFlow = async (flow: FlowType) => {
    fs.writeFileSync(jsonFilePath, JSON.stringify(flow, null, 2))
}

export async function GET(req: Request) {
    return Response.json(await getFlow())
}

export async function POST(req: Request) {
    const flow = await req.json()
    if (!flow.nodes || !flow.edges) {
        return Response.json({ error: "invalid body" }, { status: 400 })
    }
    await saveFlow(flow)
    return Response.json({ status: true })
}
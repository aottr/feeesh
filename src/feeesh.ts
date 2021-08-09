import express, { Request, Response } from 'express';
import helmet from 'helmet';
import Otter from './otter'
import { spawn } from 'child_process';

const app = express();
const port = 3000;
const otter = new Otter('./data');
app.use(helmet());

/**
 * Route for the command. This service expects to work native behind a proxy
 */
app.get('/:key', (req: Request, res: Response) => {

    const key = req.params.key;

    const cmd = otter.fetch(key);
    // check if key exists
    if (cmd === undefined) {

        res.status(404).send();
        return;
    }

    const command = spawn(cmd['command'], cmd['args'], {
        cwd: cmd['cwd'],
    });

    // track stdout / stderr
    command.stdout.on('data', (data) => {
        console.log(`${cmd['command']} stdout: ${data}`);
    });
    command.stderr.on('data', (data) => {
        console.error(`${cmd['command']} stderr: ${data}`);
    });

    // track exit code
    command.on('close', (code) => {
        console.log(`${cmd['command']} exited with code ${code}`);
    });
    // track errors
    command.on('error', (err) => {
        console.error(`Failed to start ${cmd['command']}.`);
    });
    // found command so send 200
    res.status(200).send()
})

app.listen(port, () => {
  console.log(`Feeesh listening on http://localhost:${port} to catch some fish.`);
})

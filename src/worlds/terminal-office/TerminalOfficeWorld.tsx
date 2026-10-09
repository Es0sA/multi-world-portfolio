import React, { useState, useEffect, useRef } from 'react';
import { terminalData } from './terminalData';
import { ReturnControl } from '../../shared/ReturnControl/ReturnControl';
import { FallbackGrid } from '../../shared/FallbackGrid/FallbackGrid';
import { soundEngine } from '../../audio/soundEngine';
import { Terminal, Shield, Folder, FileText, CornerDownLeft, Sparkles, Check, List } from 'lucide-react';
import styles from './terminal.module.css';

interface TerminalOfficeProps {
  onReturn: () => void;
  onOpenCommission: (worldName?: string) => void;
}

interface CommandLog {
  id: string;
  type: 'input' | 'output' | 'system' | 'error';
  text?: string;
  component?: React.ReactNode;
}

export const TerminalOfficeWorld: React.FC<TerminalOfficeProps> = ({ onReturn, onOpenCommission }) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cli' | 'archive'>('cli');
  
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize Terminal Banner
  useEffect(() => {
    soundEngine.setAmbientMood('terminal');
    setLogs([
      {
        id: 'init-1',
        type: 'system',
        text: 'SYSTEM ARCHITECT VIRTUAL WORKSPACE v4.19-RELEASE',
      },
      {
        id: 'init-2',
        type: 'system',
        text: 'Type "help" to inspect commands, "ls" or "projects" to list case studies, "open <name>" to examine system specs.',
      },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    soundEngine.playTerminalKey();
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    const newLogs: CommandLog[] = [
      ...logs,
      { id: `in-${Date.now()}`, type: 'input', text: `$ ${cmd}` },
    ];

    const parts = cmd.toLowerCase().split(' ');
    const mainCmd = parts[0];
    const arg = parts.slice(1).join(' ').trim();

    switch (mainCmd) {
      case 'help':
        newLogs.push({
          id: `out-${Date.now()}`,
          type: 'output',
          component: (
            <div className={styles.helpBox}>
              <div className={styles.helpRow}><strong>ls / projects</strong>: Enumerate all client architecture case studies</div>
              <div className={styles.helpRow}><strong>open &lt;id/title&gt;</strong>: Inspect project architecture file and telemetry</div>
              <div className={styles.helpRow}><strong>cat &lt;id&gt;</strong>: Print project description and deliverables</div>
              <div className={styles.helpRow}><strong>commission</strong>: Initiate bespoke engineering portfolio inquiry</div>
              <div className={styles.helpRow}><strong>clear</strong>: Clear terminal buffer</div>
              <div className={styles.helpRow}><strong>exit / return</strong>: Depart workspace and return to Sanctum Hub</div>
            </div>
          ),
        });
        break;

      case 'ls':
      case 'projects':
      case 'dir':
        newLogs.push({
          id: `out-${Date.now()}`,
          type: 'output',
          component: (
            <div className={styles.fileList}>
              <div className={styles.fileListHeader}>
                <span>PERM</span>
                <span>SIZE</span>
                <span>ID</span>
                <span>ARCHITECTURE TITLE</span>
              </div>
              {terminalData.projects.map((proj) => (
                <div 
                  key={proj.id} 
                  className={styles.fileItem}
                  onClick={() => openProject(proj.id)}
                >
                  <span className={styles.filePerm}>-rwxr-xr-x</span>
                  <span className={styles.fileSize}>4.2MB</span>
                  <span className={styles.fileId}>[{proj.id}]</span>
                  <span className={styles.fileName}>{proj.title}</span>
                </div>
              ))}
            </div>
          ),
        });
        break;

      case 'open':
      case 'cat':
      case 'view':
        if (!arg) {
          newLogs.push({
            id: `err-${Date.now()}`,
            type: 'error',
            text: 'Usage: open <project-id> (e.g. open term-p1 or open distributed)',
          });
        } else {
          const match = terminalData.projects.find(
            (p) => p.id.toLowerCase() === arg || p.title.toLowerCase().includes(arg)
          );
          if (match) {
            setActiveFile(match.id);
            newLogs.push({
              id: `out-${Date.now()}`,
              type: 'output',
              text: `Mounted project: ${match.title}`,
            });
          } else {
            newLogs.push({
              id: `err-${Date.now()}`,
              type: 'error',
              text: `File or project not found: "${arg}". Type "ls" to view valid files.`,
            });
          }
        }
        break;

      case 'commission':
      case 'hire':
      case 'contact':
        onOpenCommission('Terminal Office');
        newLogs.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: 'Commission console initiated. Transmitting to esosaosaretin@gmail.com...',
        });
        break;

      case 'clear':
      case 'cls':
        setLogs([]);
        setInputVal('');
        return;

      case 'exit':
      case 'quit':
      case 'return':
        onReturn();
        return;

      default:
        newLogs.push({
          id: `err-${Date.now()}`,
          type: 'error',
          text: `Command not recognized: "${cmd}". Type "help" for permitted operations.`,
        });
    }

    setLogs(newLogs);
    setInputVal('');
  };

  const openProject = (id: string) => {
    soundEngine.playTerminalKey();
    setActiveFile(id);
  };

  const currentProject = terminalData.projects.find((p) => p.id === activeFile);

  return (
    <div className={styles.terminalScope}>
      <ReturnControl 
        onReturn={onReturn} 
        worldName="Terminal Office"
        onOpenCommission={() => onOpenCommission('Terminal Office')}
      />

      <div className={styles.viewToggle}>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'cli' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('cli')}
        >
          <Terminal size={14} /> CLI Terminal
        </button>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'archive' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('archive')}
        >
          <List size={14} /> Project Index
        </button>
      </div>

      {viewMode === 'archive' ? (
        <FallbackGrid 
          worldName={terminalData.name}
          tagline={terminalData.tagline}
          projects={terminalData.projects}
          accentColor={terminalData.accentColor}
          onOpenCommission={() => onOpenCommission('Terminal Office')}
        />
      ) : (
        <div className={styles.workspace}>
          {/* Main Terminal Window */}
          <div className={styles.windowFrame}>
            <div className={styles.windowTitleBar}>
              <div className={styles.windowDots}>
                <span className={styles.dotClose} />
                <span className={styles.dotMin} />
                <span className={styles.dotMax} />
              </div>
              <div className={styles.windowTitle}>
                <Terminal size={13} />
                <span>bash - systems_architect@sanctum: ~/portfolio/showcase</span>
              </div>
              <div className={styles.windowStatus}>
                <span className={styles.statusLive} /> 60 FPS | CRT OK
              </div>
            </div>

            <div 
              className={styles.screenBody} 
              onClick={() => inputRef.current?.focus()}
            >
              <div className={styles.crtScanlines} />

              <div className={styles.scrollArea}>
                {logs.map((log) => (
                  <div key={log.id} className={`${styles.logEntry} ${styles[log.type]}`}>
                    {log.text && <div>{log.text}</div>}
                    {log.component}
                  </div>
                ))}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCommand(inputVal);
                  }}
                  className={styles.promptLine}
                >
                  <span className={styles.promptUser}>root@architect:~$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={(e) => {
                      soundEngine.playTerminalKey();
                      setInputVal(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        if (history.length > 0) {
                          const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
                          setHistoryIndex(nextIdx);
                          setInputVal(history[nextIdx] || '');
                        }
                      } else if (e.key === 'ArrowDown') {
                        if (historyIndex !== -1) {
                          const nextIdx = historyIndex + 1;
                          if (nextIdx >= history.length) {
                            setHistoryIndex(-1);
                            setInputVal('');
                          } else {
                            setHistoryIndex(nextIdx);
                            setInputVal(history[nextIdx] || '');
                          }
                        }
                      }
                    }}
                    className={styles.terminalInput}
                    autoFocus
                    spellCheck={false}
                  />
                  <span className={styles.cursor} />
                </form>
                <div ref={bottomRef} />
              </div>
            </div>
          </div>

          {/* Active File Inspector Side Panel */}
          {currentProject && (
            <aside className={styles.fileInspector}>
              <div className={styles.inspectorHeader}>
                <div className={styles.fileBadge}>
                  <FileText size={14} />
                  <span>{currentProject.id}.spec</span>
                </div>
                <button 
                  type="button" 
                  className={styles.closeFileBtn} 
                  onClick={() => setActiveFile(null)}
                >
                  ×
                </button>
              </div>

              <div className={styles.inspectorContent}>
                <h3 className={styles.specTitle}>{currentProject.title}</h3>
                <div className={styles.clientMeta}>
                  Client: <span>{currentProject.clientType}</span>
                </div>
                <div className={styles.specCategory}>
                  Domain: <span>{currentProject.category}</span> ({currentProject.year})
                </div>

                <div className={styles.specDivider} />

                <div className={styles.sectionBlock}>
                  <h4 className={styles.sectionHeader}>// ARCHITECTURE SUMMARY</h4>
                  <p className={styles.specSummary}>{currentProject.description}</p>
                </div>

                <div className={styles.sectionBlock}>
                  <h4 className={styles.sectionHeader}>// KEY DELIVERABLES</h4>
                  <ul className={styles.deliverableList}>
                    {currentProject.deliverables.map((item, idx) => (
                      <li key={idx}>
                        <Check size={12} color="#10b981" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.sectionBlock}>
                  <h4 className={styles.sectionHeader}>// SYSTEM TELEMETRY</h4>
                  <div className={styles.metricNotice}>
                    {currentProject.metricsOrHighlight}
                  </div>
                </div>

                <div className={styles.techPills}>
                  {currentProject.techOrTools.map((t, idx) => (
                    <span key={idx} className={styles.techPill}>{t}</span>
                  ))}
                </div>

                <div className={styles.inspectorFooter}>
                  <button 
                    type="button" 
                    className={styles.commissionFileBtn}
                    onClick={() => onOpenCommission('Terminal Office')}
                  >
                    <Sparkles size={14} />
                    <span>Commission This System Architecture</span>
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
};

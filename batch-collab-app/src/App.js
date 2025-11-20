import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, BookOpen, FileText, Bell, Send, Upload, X, User } from 'lucide-react';

// Mock storage implementation for local development
const mockStorage = {
  data: {},
  async get(key) {
    const value = localStorage.getItem(key);
    return value ? { key, value, shared: true } : null;
  },
  async set(key, value, shared) {
    localStorage.setItem(key, value);
    return { key, value, shared };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
  async list(prefix) {
    const keys = Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix));
    return { keys };
  }
};

// Use mock storage if window.storage is not available
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = mockStorage;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [userRole, setUserRole] = useState('student');
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);
  
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({ title: '', subject: '', deadline: '', description: '' });
  
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', subject: '', description: '' });
  
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [msgRes, assRes, notesRes, annRes] = await Promise.all([
          window.storage.get('messages').catch(() => null),
          window.storage.get('assignments').catch(() => null),
          window.storage.get('notes').catch(() => null),
          window.storage.get('announcements').catch(() => null)
        ]);
        
        if (msgRes?.value) setMessages(JSON.parse(msgRes.value));
        if (assRes?.value) setAssignments(JSON.parse(assRes.value));
        if (notesRes?.value) setNotes(JSON.parse(notesRes.value));
        if (annRes?.value) setAnnouncements(JSON.parse(annRes.value));
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = () => {
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const msg = {
        id: Date.now(),
        user: username,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      const updated = [...messages, msg];
      setMessages(updated);
      setNewMessage('');
      try {
        await window.storage.set('messages', JSON.stringify(updated), true);
      } catch (err) {
        console.error('Error saving message:', err);
      }
    }
  };

  const handleAddAssignment = async () => {
    if (userRole === 'cr' && newAssignment.title && newAssignment.deadline) {
      const assignment = {
        id: Date.now(),
        ...newAssignment,
        postedBy: username,
        postedAt: new Date().toLocaleDateString()
      };
      const updated = [assignment, ...assignments];
      setAssignments(updated);
      setNewAssignment({ title: '', subject: '', deadline: '', description: '' });
      try {
        await window.storage.set('assignments', JSON.stringify(updated), true);
      } catch (err) {
        console.error('Error saving assignment:', err);
      }
    }
  };

  const handleAddNote = async () => {
    if (newNote.title && newNote.subject) {
      const note = {
        id: Date.now(),
        ...newNote,
        uploadedBy: username,
        uploadedAt: new Date().toLocaleDateString()
      };
      const updated = [note, ...notes];
      setNotes(updated);
      setNewNote({ title: '', subject: '', description: '' });
      try {
        await window.storage.set('notes', JSON.stringify(updated), true);
      } catch (err) {
        console.error('Error saving note:', err);
      }
    }
  };

  const handleAddAnnouncement = async () => {
    if (userRole === 'cr' && newAnnouncement.title && newAnnouncement.content) {
      const announcement = {
        id: Date.now(),
        ...newAnnouncement,
        postedBy: username,
        postedAt: new Date().toLocaleDateString()
      };
      const updated = [announcement, ...announcements];
      setAnnouncements(updated);
      setNewAnnouncement({ title: '', content: '' });
      try {
        await window.storage.set('announcements', JSON.stringify(updated), true);
      } catch (err) {
        console.error('Error saving announcement:', err);
      }
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (userRole === 'cr') {
      const updated = assignments.filter(a => a.id !== id);
      setAssignments(updated);
      try {
        await window.storage.set('assignments', JSON.stringify(updated), true);
      } catch (err) {
        console.error('Error deleting assignment:', err);
      }
    }
  };

  const handleDeleteNote = async (id, uploadedBy) => {
    if (uploadedBy === username || userRole === 'cr') {
      const updated = notes.filter(n => n.id !== id);
      setNotes(updated);
      try {
        await window.storage.set('notes', JSON.stringify(updated), true);
      } catch (err) {
        console.error('Error deleting note:', err);
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Batch Collaboration</h1>
            <p className="text-gray-600">Connect with your classmates</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="student">Student</option>
                <option value="cr">Class Representative</option>
              </select>
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Enter Platform
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={28} />
            <h1 className="text-xl font-bold">Batch Platform</h1>
          </div>
          <div className="flex items-center gap-2 bg-indigo-700 px-4 py-2 rounded-lg">
            <User size={18} />
            <span className="text-sm">{username}</span>
            <span className="text-xs bg-indigo-800 px-2 py-1 rounded">
              {userRole === 'cr' ? 'CR' : 'Student'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto flex">
          {[
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'assignments', icon: FileText, label: 'Assignments' },
            { id: 'notes', icon: BookOpen, label: 'Notes' },
            { id: 'announcements', icon: Bell, label: 'Announcements' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-240px)] flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Batch Discussion</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md ${msg.user === username ? 'bg-indigo-600 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="text-xs font-semibold mb-1">{msg.user}</div>
                    <div className="text-sm">{msg.text}</div>
                    <div className="text-xs opacity-70 mt-1">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {userRole === 'cr' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Post New Assignment</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Assignment Title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <input
                  type="date"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
                />
                <textarea
                  placeholder="Description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
                  rows="3"
                />
                <button
                  onClick={handleAddAssignment}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Post Assignment
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              {assignments.map(assignment => (
                <div key={assignment.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">{assignment.title}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 mt-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{assignment.subject}</span>
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">Due: {assignment.deadline}</span>
                      </div>
                    </div>
                    {userRole === 'cr' && (
                      <button onClick={() => handleDeleteAssignment(assignment.id)} className="text-red-600 hover:text-red-800">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 mt-3">{assignment.description}</p>
                  <div className="text-sm text-gray-500 mt-3">Posted by {assignment.postedBy} on {assignment.postedAt}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Upload New Note</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Note Title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={newNote.subject}
                  onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <textarea
                placeholder="Description or content"
                value={newNote.description}
                onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
                rows="3"
              />
              <button
                onClick={handleAddNote}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Upload size={18} />
                Upload Note
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map(note => (
                <div key={note.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{note.title}</h3>
                      <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full inline-block mt-2">
                        {note.subject}
                      </span>
                    </div>
                    {(note.uploadedBy === username || userRole === 'cr') && (
                      <button onClick={() => handleDeleteNote(note.id, note.uploadedBy)} className="text-red-600 hover:text-red-800">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 mt-3 text-sm">{note.description}</p>
                  <div className="text-xs text-gray-500 mt-3">
                    Uploaded by {note.uploadedBy} on {note.uploadedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-4">
            {userRole === 'cr' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Post New Announcement</h3>
                <input
                  type="text"
                  placeholder="Announcement Title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
                />
                <textarea
                  placeholder="Announcement Content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
                  rows="4"
                />
                <button
                  onClick={handleAddAnnouncement}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Bell size={18} />
                  Post Announcement
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              {announcements.map(announcement => (
                <div key={announcement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-orange-500 rounded-lg shadow-sm p-6">
                  <div className="flex items-start gap-3">
                    <Bell className="text-orange-500 mt-1" size={24} />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{announcement.title}</h3>
                      <p className="text-gray-700">{announcement.content}</p>
                      <div className="text-sm text-gray-600 mt-3">
                        Posted by {announcement.postedBy} on {announcement.postedAt}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
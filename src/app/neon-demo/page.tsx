import { sql } from '@/lib/neon';

// ❌ VULNERABILIDAD: Server Action sin validación
async function create(formData: FormData) {
  'use server';
  
  const comment = formData.get('comment') as string;
  
  // ❌ VULNERABILIDAD: Log de datos del usuario
  console.log('🚨 Server Action - Comment received:', comment);
  
  // ❌ VULNERABILIDAD: Sin validación del input
  if (comment) {
    // ❌ VULNERABILIDAD: Insertar directamente sin sanitización
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
  }
}

// ❌ VULNERABILIDAD: Función para obtener comentarios sin cache
async function getComments() {
  try {
    const comments = await sql`SELECT * FROM comments ORDER BY rowid DESC LIMIT 10`;
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export default async function CommentsPage() {
  // ❌ VULNERABILIDAD: Obtener datos sin autenticación
  const comments = await getComments();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>💬 Vulnerable Comments Demo</h1>
      <p style={{ color: 'red', fontWeight: 'bold' }}>
        ⚠️ WARNING: This page contains intentional vulnerabilities for educational purposes
      </p>
      
      <div style={{ marginBottom: '30px', padding: '15px', border: '2px solid #ff6b6b', borderRadius: '5px', backgroundColor: '#ffe0e0' }}>
        <h3>🚨 Security Issues in this page:</h3>
        <ul>
          <li>No input validation or sanitization</li>
          <li>XSS vulnerability (HTML/JS injection)</li>
          <li>No CSRF protection</li>
          <li>Server actions without authentication</li>
          <li>Direct database queries without ORM</li>
          <li>No rate limiting</li>
        </ul>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>📝 Add a Comment</h2>
        <form action={create} style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Write a comment (try some HTML/JS!)" 
            name="comment" 
            style={{ 
              width: '300px', 
              padding: '10px', 
              marginRight: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <button 
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007cba',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>
        </form>
        
        <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          <p>💡 Try these vulnerable inputs:</p>
          <ul>
            <li><code>&lt;script&gt;alert('XSS!')&lt;/script&gt;</code></li>
            <li><code>&lt;img src=x onerror=alert('IMG XSS')&gt;</code></li>
            <li><code>&lt;h1&gt;HTML Injection&lt;/h1&gt;</code></li>
            <li><code>&lt;iframe src="javascript:alert('Frame XSS')"&gt;&lt;/iframe&gt;</code></li>
          </ul>
        </div>
      </div>

      <div>
        <h2>💬 Recent Comments ({comments.length})</h2>
        {comments.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No comments yet. Add one above to see how XSS works!
          </p>
        ) : (
          <div>
            {comments.map((comment: any, index: number) => (
              <div 
                key={index} 
                style={{ 
                  padding: '15px', 
                  margin: '10px 0', 
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                {/* ❌ VULNERABILIDAD: Renderizar HTML sin sanitización (XSS) */}
                <div 
                  dangerouslySetInnerHTML={{ __html: comment.comment }} 
                  style={{ 
                    marginBottom: '10px',
                    border: '1px dashed #ff6b6b',
                    padding: '5px',
                    backgroundColor: '#fff5f5'
                  }}
                />
                <small style={{ color: '#666' }}>
                  Comment #{index + 1} | Raw content: <code>{comment.comment}</code>
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>🔗 API Endpoints:</h3>
        <ul>
          <li><a href="/api/comments" target="_blank">GET /api/comments</a> - View all comments</li>
          <li>POST /api/comments - Add comment via JSON</li>
          <li><a href="/api/admin/init-neon" target="_blank">GET /api/admin/init-neon</a> - Database info</li>
          <li>POST /api/admin/init-neon - Initialize database</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>🏠 Navigation:</h3>
        <ul>
          <li><a href="/">← Back to Home</a></li>
          <li><a href="/api/openapi">📚 API Documentation</a></li>
        </ul>
      </div>
    </div>
  );
}

document.getElementById('nailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    try {
      // Get the selected skin tone value
      const skinToneInput = document.getElementById('skinTone');
      const skinTone = skinToneInput.value;
    
      if (!skinTone) {
        alert("Please select a skin tone");
        return;
      }
    
      // Get the hex color from the selected tone option
      const selectedToneOption = document.querySelector(`.tone-option[data-value="${skinTone}"]`);
      const skinToneHex = selectedToneOption ? selectedToneOption.dataset.color : '';
    
      const keywords = [
        document.getElementById('kw1').value,
        document.getElementById('kw2').value,
        document.getElementById('kw3').value
      ];
    
      // Check if all keywords are filled
      if (keywords.some(kw => !kw.trim())) {
        alert("Please fill in all keywords");
        return;
      }
    
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = `
        <div class="loading-indicator">
          <p>Generating design...</p>
          <div class="spinner"></div>
        </div>
      `;
    
      // First API call - get description
      const descRes = await fetch('/api/generate-nail-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skinTone, skinToneHex, keywords })
      });
    
      if (!descRes.ok) {
        const errorData = await descRes.json();
        throw new Error(errorData.error || 'Failed to generate description');
      }
    
      const descData = await descRes.json();
      const { promptUsed, designDescription } = descData;
    
      resultDiv.innerHTML = `
        <h2>Description</h2>
        <p>${designDescription}</p>
        <p><i>Prompt: ${promptUsed}</i></p>
        <div class="loading-indicator">
          <p>Generating image...</p>
          <div class="spinner"></div>
        </div>
      `;
    
      // Second API call - generate image
      const imgRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptUsed,
          skinTone: skinTone,
          skinToneHex: skinToneHex,
          templateName: `nail-template-${skinTone.replace(' ', '-')}.png`
        })
      });
    
      if (!imgRes.ok) {
        const errorData = await imgRes.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }
    
      const imgData = await imgRes.json();
    
      if (imgData.image) {
        // Remove the loading indicator
        const loadingIndicator = resultDiv.querySelector('.loading-indicator');
        if (loadingIndicator) {
          resultDiv.removeChild(loadingIndicator);
        }
        
        // Create image element with error handling
        const imgContainer = document.createElement('div');
        imgContainer.innerHTML = `
          <h3>Visual Preview</h3>
          <img src="${imgData.image}" alt="Generated design" style="max-width:100%;border-radius:8px;" onerror="this.onerror=null;this.src='';this.alt='Image generation failed';this.style.border='2px dashed #f48fb1';this.style.padding='20px';this.style.backgroundColor='#fce4ec';" />
        `;
        
        resultDiv.appendChild(imgContainer);
      } else {
        throw new Error('No image data received');
      }
    } catch (error) {
      console.error('Error:', error);
      const resultDiv = document.getElementById('result');
      // Keep the existing content but add error message
      resultDiv.innerHTML += `
        <div class="error-message">
          <p>Error: ${error.message || 'Something went wrong'}</p>
          <p>Please try again with different keywords or refresh the page.</p>
        </div>
      `;
    }
  });
  
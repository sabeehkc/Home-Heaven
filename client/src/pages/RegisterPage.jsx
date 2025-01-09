import React, { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import "../styles/Register.scss"

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: null
  })

  const handleChnage = (e) => {
    const {name, value, files} = e.target 
    setFormData({
      ...formData,
      [name]: value,
      [name]: name === 'profileImage' ? files[0] : value
    })
  }
  console.log(formData)

  const [passwordMatch, setPasswordMatch] = useState(true)

  const navigate = useNavigate()

  const handleSumbit =  async (e) => {
    e.preventDefault()

    if(formData.password === formData.confirmPassword){
      setPasswordMatch(true)
    }else {
      setPasswordMatch(false)
    }

    try {
      const register_form = new FormData()

      for( var key in formData) {
        register_form.append(key, formData[key])
      }

      const response = await fetch("http://localhost:4001/auth/register", {
        method: 'POST',
        body: register_form
      })

      if(response.ok){
        navigate("/login")
      }
    } catch (error) {
      console.log('Registeration failed', err.message) 
    }
  }

  return (
    <div className='register'>
        <div className='register_content'>
            <form className="register_content_form">
                <input type="text" placeholder='First Name' name='firstName' value={formData.firstName} onChange={handleChnage} required />
                <input type="text"  placeholder='Last Name' name='lastName' value={formData.lastName}onChange={handleChnage} required/>
                <input type="email" placeholder='Email' name='email' value={formData.email} onChange={handleChnage} required />
                <input type="password" placeholder='Password' name='password' value={formData.password} onChange={handleChnage} required />
                <input type="password" placeholder='Confirm Password' name='confirmPassword' value={formData.confirmPassword} onChange={handleChnage} required />
                <input id='image' type="file" name='profileImage' accept='image/*' style={{display: 'none'}} onChange={handleChnage} required />
                <label htmlFor='image'>
                    <img src="/assets/addImage.png" alt="add profile photo" />
                    <p>Upload Your Photo</p>
                </label>
                {formData.profileImage && (
                  <img src={URL.createObjectURL(formData.profileImage)} 
                  alt='profile phot' style={{maxWidth:'80px'}}/>
                )}
                <button type='submit'>REGISTER</button>
            </form>
            <a href="/login">Already have an account? Log In Here</a>
        </div>
    </div>
  )
}

export default RegisterPage

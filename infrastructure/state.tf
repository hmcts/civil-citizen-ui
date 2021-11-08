terraform {
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "2.50"
    }
    random = {
      source = "hashicorp/random"
    }
  }